import mongoose, { Types } from "mongoose";

import { AppError } from "../core/errors/AppError.js";
import { config } from "../config/index.js";
import {
  MAX_LOGIN_ATTEMPTS,
  ACCOUNT_LOCK_MINUTES,
} from "../config/security.js";
import { logger } from "../config/logger.js";

import { passwordService } from "../security/password/password.service.js";
import {
  tokenHashService,
  tokenService,
  type JwtPayload,
} from "../security/index.js";
import { jwtService } from "../security/jwt/jwt.service.js";

import { userRepository } from "../modules/auth/repositories/user.repository.js";
import { sessionRepository } from "../modules/auth/repositories/session.repository.js";
import { verificationTokenRepository } from "../modules/auth/repositories/verification-token.repository.js";
import { passwordResetTokenRepository } from "../modules/auth/repositories/password-reset-token.repository.js";

import { UserMapper } from "../modules/auth/mapper/user.mapper.js";
import { SessionMapper } from "../modules/auth/mapper/session.mapper.js";

import { emailService } from "../modules/email/index.js";

import { auditService } from "../modules/audit/services/audit.service.js";
import { AuditEvent } from "../modules/audit/types/audit-event.js";

import { securityEventService } from "../modules/security/services/security-event.service.js";
import { SecurityEvent } from "../modules/security/types/security-event.js";

import { addDays, addMinutes } from "../shared/utils/date.js";

import type { RegisterInput } from "../validators/auth.validator.js";
import type { LoginInput } from "../validators/login.schema.js";
import type { ResetPasswordInput } from "../validators/reset-password.schema.js";
import type { RefreshTokenInput } from "../validators/refresh-token.schema.js";
import type { LogoutInput } from "../validators/logout.schema.js";

export class AuthService {
  async register(applicationId: Types.ObjectId, data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(
      applicationId,
      data.email,
    );

    if (existingUser) {
      throw new AppError("An Account with this email already exist", 409, true);
    }

    const hashedPassword = await passwordService.hash(data.password);

    const user = await userRepository.create({
      applicationId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHashed: hashedPassword,
    });

    const verificationToken = await this.sendVerificationEmail(
      applicationId,
      user,
    );

    const response = UserMapper.toResponse(user);

    if (config.isTest) {
      return {
        ...response,
        verificationToken,
      };
    }

    return response;
  }

  async login(applicationId: Types.ObjectId, data: LoginInput) {
    const user = await userRepository.findEmailWithPassword(
      applicationId,
      data.email,
    );

    if (!user) {
      throw new AppError("Invalid Email or Password", 401, true);
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new AppError(
        "Account temporarily locked. Please try again later.",
        423,
        true,
      );
    }

    const validPassword = await passwordService.verify(
      user.passwordHashed,
      data.password,
    );

    if (!validPassword) {
      await userRepository.incrementFailedLoginAttempts(applicationId, user.id);

      await securityEventService.log({
        applicationId,
        userId: user.id,
        event: SecurityEvent.LOGIN_FAILED,
      });

      const attempts = await userRepository.getFailedAttempts(
        applicationId,
        user.id,
      );

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        await userRepository.lockAccount(
          applicationId,
          user.id,
          addMinutes(ACCOUNT_LOCK_MINUTES),
        );

        await securityEventService.log({
          applicationId,
          userId: user.id,
          event: SecurityEvent.ACCOUNT_LOCKED,
          metadata: {
            reason: "MAX_LOGIN_ATTEMPTS_EXCEEDED",
            attempts,
          },
        });

        throw new AppError(
          "Account locked due to too many failed login attempts.",
          423,
          true,
        );
      }

      throw new AppError("Invalid Email or Password", 401, true);
    }

    await userRepository.resetFailedLoginAttempts(applicationId, user.id);

    if (!user.emailVerified) {
      throw new AppError(
        "Please verify your email before logging in",
        403,
        true,
      );
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      applicationId: applicationId.toString(),
    };

    const accessToken = await jwtService.generateAccessToken(payload);

    const refreshToken = await jwtService.generateRefreshToken(payload);

    const refreshTokenHash = tokenHashService.hash(refreshToken);

    await sessionRepository.create({
      applicationId,
      userId: user._id,
      refreshTokenHash,
      expiresAt: addDays(config.SESSION_EXPIRES_IN_DAYS),
    });

    await auditService.log({
      applicationId,
      userId: user.id,
      event: AuditEvent.LOGIN,
    });

    await securityEventService.log({
      applicationId,
      userId: user.id,
      event: SecurityEvent.LOGIN_SUCCESS,
    });

    return {
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(applicationId: Types.ObjectId, data: RefreshTokenInput) {
    let payload: JwtPayload;

    try {
      payload = await jwtService.verifyRefreshToken(data.refreshToken);
    } catch {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    if (payload.applicationId !== applicationId.toString()) {
      throw new AppError("Invalid authentication context.", 401, true);
    }

    const refreshTokenHash = tokenHashService.hash(data.refreshToken);

    const userId = new Types.ObjectId(payload.sub);

    const session = await sessionRepository.findByUserIdAndRefreshTokenHash(
      applicationId,
      userId,
      refreshTokenHash,
    );

    if (!session) {
      throw new AppError(
        "Refresh token reuse detected. Please login again.",
        401,
        true,
      );
    }

    const dbSession = await mongoose.startSession();

    try {
      dbSession.startTransaction();

      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        applicationId: applicationId.toString(),
      };

      const accessToken = await jwtService.generateAccessToken(newPayload);

      const newRefreshToken = await jwtService.generateRefreshToken(newPayload);

      const newRefreshTokenHash = tokenHashService.hash(newRefreshToken);

      await sessionRepository.deleteByIdInApplication(
        applicationId,
        session.id,
        dbSession,
      );

      await sessionRepository.create(
        {
          applicationId,
          userId,
          refreshTokenHash: newRefreshTokenHash,
          expiresAt: addDays(config.SESSION_EXPIRES_IN_DAYS),
        },
        dbSession,
      );

      await securityEventService.log({
        applicationId,
        userId: payload.sub,
        event: SecurityEvent.TOKEN_REFRESHED,
      });

      await dbSession.commitTransaction();

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      await dbSession.endSession();
    }
  }

  async getMySessions(applicationId: Types.ObjectId, userId: string) {
    const sessions = await sessionRepository.findByUserId(
      applicationId,
      new Types.ObjectId(userId),
    );

    return sessions.map(SessionMapper.toResponse);
  }

  async logout(
    applicationId: Types.ObjectId,
    data: LogoutInput,
  ): Promise<void> {
    let payload: JwtPayload;

    try {
      payload = await jwtService.verifyRefreshToken(data.refreshToken);
    } catch {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    if (payload.applicationId !== applicationId.toString()) {
      throw new AppError("Invalid authentication context.", 401, true);
    }

    const refreshTokenHash = tokenHashService.hash(data.refreshToken);

    const session = await sessionRepository.findByUserIdAndRefreshTokenHash(
      applicationId,
      new Types.ObjectId(payload.sub),
      refreshTokenHash,
    );

    if (!session) {
      return;
    }

    await sessionRepository.deleteByIdInApplication(applicationId, session.id);

    await securityEventService.log({
      applicationId,
      userId: payload.sub,
      event: SecurityEvent.LOGOUT,
    });
  }

  async logoutAll(
    applicationId: Types.ObjectId,
    data: LogoutInput,
  ): Promise<void> {
    let payload: JwtPayload;

    try {
      payload = await jwtService.verifyRefreshToken(data.refreshToken);
    } catch {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    if (payload.applicationId !== applicationId.toString()) {
      throw new AppError("Invalid authentication context.", 401, true);
    }

    const userId = new Types.ObjectId(payload.sub);

    await sessionRepository.deleteAllForUser(applicationId, userId);

    await securityEventService.log({
      applicationId,
      userId: payload.sub,
      event: SecurityEvent.LOGOUT_ALL,
    });
  }

  async verifyEmail(
    applicationId: Types.ObjectId,
    token: string,
  ): Promise<void> {
    const tokenHash = tokenHashService.hash(token);

    const verificationToken = await verificationTokenRepository.findByTokenHash(
      applicationId,
      tokenHash,
    );

    if (!verificationToken) {
      throw new AppError("Invalid verification Token", 400, true);
    }

    const user = await userRepository.findByIdInApplication(
      applicationId,
      verificationToken.userId.toString(),
    );

    if (!user) {
      throw new AppError("Invalid verification Token", 400, true);
    }

    await userRepository.verifyUser(applicationId, verificationToken.userId);

    await verificationTokenRepository.deleteByIdInApplication(
      applicationId,
      verificationToken.id,
    );

    await securityEventService.log({
      applicationId,
      userId: verificationToken.userId.toString(),
      event: SecurityEvent.EMAIL_VERIFIED,
    });
  }

  private async sendVerificationEmail(
    applicationId: Types.ObjectId,
    user: {
      _id: Types.ObjectId;
      firstName: string;
      email: string;
    },
  ): Promise<string> {
    const verificationToken = tokenService.generateVerificationToken();

    const verificationTokenHash = tokenHashService.hash(verificationToken);

    await verificationTokenRepository.deleteByUserId(applicationId, user._id);

    await verificationTokenRepository.create({
      applicationId,
      userId: user._id,
      tokenHash: verificationTokenHash,
      expiresAt: addDays(1),
    });

    try {
      await emailService.sendVerificationEmail({
        email: user.email,
        firstName: user.firstName,
        verificationToken,
      });
    } catch (error) {
      logger.error(
        {
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                }
              : error,
          userId: user._id.toString(),
          email: user.email,
        },
        "Failed to send verification token",
      );
    }

    return verificationToken;
  }

  async resendVerificationEmail(
    applicationId: Types.ObjectId,
    email: string,
  ): Promise<void> {
    const user = await userRepository.findByEmail(applicationId, email);

    if (!user) {
      return;
    }

    if (user.emailVerified) {
      return;
    }

    await this.sendVerificationEmail(applicationId, user);
  }

  private async sendPasswordResetEmail(
    applicationId: Types.ObjectId,
    user: {
      _id: Types.ObjectId;
      firstName: string;
      email: string;
    },
  ): Promise<string> {
    const resetToken = tokenService.generatePasswordResetToken();

    const resetTokenHash = tokenHashService.hash(resetToken);

    await passwordResetTokenRepository.deleteByUserId(applicationId, user._id);

    await passwordResetTokenRepository.create({
      applicationId,
      userId: user._id,
      tokenHash: resetTokenHash,
      expiresAt: addDays(1),
    });

    try {
      await emailService.sendPasswordResetEmail({
        email: user.email,
        firstName: user.firstName,
        resetToken,
      });
    } catch (error) {
      logger.error(
        {
          error,
          userId: user._id.toString(),
          email: user.email,
        },
        "Failed to send password resend email",
      );
    }

    return resetToken;
  }

  async forgotPassword(applicationId: Types.ObjectId, email: string) {
    const user = await userRepository.findByEmail(applicationId, email);

    if (!user) {
      return config.isTest ? { resetToken: null } : undefined;
    }

    const resetToken = await this.sendPasswordResetEmail(applicationId, user);

    await securityEventService.log({
      applicationId,
      userId: user.id,
      event: SecurityEvent.PASSWORD_RESET_REQUESTED,
    });

    if (config.isTest) {
      return {
        resetToken,
      };
    }

    return;
  }

  async revokeSession(
    applicationId: Types.ObjectId,
    userId: string,
    sessionId: string,
  ) {
    const owner = await sessionRepository.belongsToUser(
      applicationId,
      sessionId,
      new Types.ObjectId(userId),
    );

    if (!owner) {
      throw new AppError("Session not found", 404, true);
    }

    await sessionRepository.deleteByIdInApplication(applicationId, sessionId);

    await securityEventService.log({
      applicationId,
      userId,
      event: SecurityEvent.SESSION_REVOKED,
      metadata: {
        sessionId,
      },
    });
  }

  async revokeOtherSessions(
    applicationId: Types.ObjectId,
    userId: string,
    refreshToken: string,
  ) {
    let payload: JwtPayload;

    try {
      payload = await jwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    if (payload.applicationId !== applicationId.toString()) {
      throw new AppError("Invalid authentication context.", 401, true);
    }

    if (payload.sub !== userId) {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    const hash = tokenHashService.hash(refreshToken);

    const session = await sessionRepository.findByUserIdAndRefreshTokenHash(
      applicationId,
      new Types.ObjectId(payload.sub),
      hash,
    );

    if (!session) {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    await sessionRepository.deleteOthers(
      applicationId,
      new Types.ObjectId(userId),
      session.id,
    );

    await securityEventService.log({
      applicationId,
      userId,
      event: SecurityEvent.OTHER_SESSIONS_REVOKED,
    });
  }

  async resetPassword(
    applicationId: Types.ObjectId,
    data: ResetPasswordInput,
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const tokenHash = tokenHashService.hash(data.token);

      const passwordResetToken =
        await passwordResetTokenRepository.findByTokenHash(
          applicationId,
          tokenHash,
        );

      if (!passwordResetToken) {
        throw new AppError("Invalid or expired token", 400, true);
      }

      const user = await userRepository.findByIdInApplication(
        applicationId,
        passwordResetToken.userId.toString(),
      );

      if (!user) {
        throw new AppError("Invalid or expired token", 400, true);
      }

      const passwordHashed = await passwordService.hash(data.password);

      await userRepository.updatePassword(
        applicationId,
        user._id,
        passwordHashed,
        session,
      );

      await passwordResetTokenRepository.deleteByIdInApplication(
        applicationId,
        passwordResetToken.id,
        session,
      );

      await securityEventService.log({
        applicationId,
        userId: user.id,
        event: SecurityEvent.PASSWORD_CHANGED,
      });

      await sessionRepository.deleteByUserId(applicationId, user._id, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

export const authService = new AuthService();
