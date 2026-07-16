import mongoose, { Types } from "mongoose";
import { passwordService } from "./../security/password/password.service.js";
import { AppError } from "../core/errors/AppError.js";
import { userRepository } from "../modules/auth/repositories/user.repository.js";
import { tokenHashService, tokenService } from "../security/index.js";
import { jwtService } from "../security/jwt/jwt.service.js";
import type { RegisterInput } from "../validators/auth.validator.js";
import type { LoginInput } from "../validators/login.schema.js";
import { UserMapper } from "../modules/auth/mapper/user.mapper.js";
import { sessionRepository } from "../modules/auth/repositories/session.repository.js";
import { addDays } from "../shared/utils/date.js";
import { config } from "../config/index.js";
import { verificationTokenRepository } from "../modules/auth/repositories/verification-token.repository.js";
import { emailService } from "../modules/email/index.js";
import { logger } from "../config/logger.js";
import { passwordResetTokenRepository } from "../modules/auth/repositories/password-reset-token.repository.js";
import type { ResetPasswordInput } from "../validators/reset-password.schema.js";
import type { RefreshTokenInput } from "../validators/refresh-token.schema.js";

export class AuthService {
  async register(data: RegisterInput) {
    // check if user exist
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("An Account with this email already exist", 409, true);
    }
    const hashedPassword = await passwordService.hash(data.password);
    // const isValid = await verifyPassword(hashedPassword, data.password);
    // console.log(hashedPassword, isValid);

    // create the user
    const user = await userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHashed: hashedPassword,
      email: data.email,
    });

    await this.sendVerificationEmail(user);

    return UserMapper.toResponse(user);
    // return {
    //   id: userId,
    //   email: data.email,
    //   hashedPassword,
    //   accessToken,
    //   refreshToken,
    //   createdAt: new Date(),
    // };
  }

  async login(data: LoginInput) {
    const user = await userRepository.findEmailWithPassword(data.email);
    if (!user) {
      throw new AppError("Invalid Email or Password", 401, true);
    }

    const validPassword = await passwordService.verify(
      user.passwordHashed,
      data.password,
    );
    if (!validPassword) {
      throw new AppError("Invalid Email or Password", 401, true);
    }
    if (!user.emailVerified) {
      throw new AppError(
        "Please verify your email before logging in",
        403,
        true,
      );
    }
    // Generate JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // Generate tokens
    const accessToken = await jwtService.generateAccessToken(payload);
    const refreshToken = await jwtService.generateRefreshToken(payload);

    // Hash refresh token
    const refreshTokenHash = tokenHashService.hash(refreshToken);

    // create session
    await sessionRepository.create({
      userId: user._id,
      refreshTokenHash,
      expiresAt: addDays(config.SESSION_EXPIRES_IN_DAYS),
    });

    return {
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(data: RefreshTokenInput) {
    // Verify the refresh token
    const payload = await jwtService.verifyRefreshToken(data.refreshToken);

    // console.log(payload);

    // Hash the incoming refresh token
    const refreshTokenHash = tokenHashService.hash(data.refreshToken);

    // Find the matching session
    const session = await sessionRepository.findByUserIdAndRefreshTokenHash(
      new Types.ObjectId(payload.sub),
      refreshTokenHash,
    );

    // Reject if no active session exists
    if (!session) {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    const dbSession = await mongoose.startSession();

    try {
      dbSession.startTransaction();

      //  Create a fresh JWT payload
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
      };

      // Generate new tokens
      const accessToken = await jwtService.generateAccessToken(newPayload);
      const newRefreshToken = await jwtService.generateRefreshToken(newPayload);

      // Hash the new refresh token
      const newRefreshTokenHash = tokenHashService.hash(newRefreshToken);

      // Delete the old session (rotation)
      await sessionRepository.deleteById(session.id, dbSession);

      // Store the new session
      await sessionRepository.create(
        {
          userId: new Types.ObjectId(payload.sub),
          refreshTokenHash: newRefreshTokenHash,
          expiresAt: addDays(config.SESSION_EXPIRES_IN_DAYS),
        },
        dbSession,
      );

      await dbSession.commitTransaction();

      // Return the new tokens
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

  async logout(refreshToken: string): Promise<void> {
    const payload = await jwtService.verifyRefreshToken(refreshToken);

    const refreshTokenHash = tokenHashService.hash(refreshToken);

    const session = await sessionRepository.findByUserIdAndRefreshTokenHash(
      new Types.ObjectId(payload.sub),
      refreshTokenHash,
    );

    if (session) {
      await sessionRepository.deleteById(session.id);
    }
  }
  async logoutAll(refreshToken: string): Promise<void> {
    const payload = await jwtService.verifyRefreshToken(refreshToken);

    const userId = new Types.ObjectId(payload.sub);

    await sessionRepository.deleteAllForUser(userId);
  }

  async verifyEmail(token: string): Promise<void> {
    // Hash incoming token
    const tokenHash = tokenHashService.hash(token);

    // Find verification token
    const verificationToken =
      await verificationTokenRepository.findByTokenHash(tokenHash);

    if (!verificationToken) {
      throw new AppError("Invalid verification Token", 400, true);
    }

    // Mark user as verified
    await userRepository.verifyUser(verificationToken.userId);

    // Delete token
    await verificationTokenRepository.deleteById(verificationToken.id);
  }

  private async sendVerificationEmail(user: {
    _id: Types.ObjectId;
    firstName: string;
    email: string;
  }) {
    const verificationToken = tokenService.generateVerificationToken();
    const verificationTokenHash = tokenHashService.hash(verificationToken);

    await verificationTokenRepository.deleteByUserId(user._id);
    await verificationTokenRepository.create({
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
          error,
          userId: user._id.toString(),
          email: user.email,
        },
        "Failed to send verification token",
      );
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("User not found", 404, true);
    }

    if (user.emailVerified) {
      throw new AppError("Email is already verified", 400, true);
    }

    await this.sendVerificationEmail(user);
  }

  private async sendPasswordResetEmail(user: {
    _id: Types.ObjectId;
    firstName: string;
    email: string;
  }): Promise<void> {
    // Generate raw token
    const resetToken = tokenService.generatePasswordResetToken();

    // Hash token before storing
    const resetTokenHash = tokenHashService.hash(resetToken);

    // Delete any existing reset tokens
    await passwordResetTokenRepository.deleteByUserId(user._id);

    // Save the new token
    await passwordResetTokenRepository.create({
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
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);

    if (!user) return;

    await this.sendPasswordResetEmail(user);
  }

  async resetPassword(data: ResetPasswordInput): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Hash incoming token

      const tokenHash = tokenHashService.hash(data.token);

      // Find stored token
      const passwordResetToken =
        await passwordResetTokenRepository.findByTokenHash(tokenHash);

      if (!passwordResetToken) {
        throw new AppError("Invalid or expired token", 400, true);
      }

      // find user
      const user = await userRepository.findById(
        passwordResetToken.userId.toString(),
      );

      if (!user) {
        throw new AppError("User not found", 404, true);
      }

      // Hash new password
      const passwordHashed = await passwordService.hash(data.password);

      // Update password
      await userRepository.updatePassword(user._id, passwordHashed, session);

      // Delete reset token
      await passwordResetTokenRepository.deleteById(
        passwordResetToken.id,
        session,
      );

      // Delete ALL sessions
      await sessionRepository.deleteByUserId(user._id, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      await session.endSession();
    }
  }

  // async refreshToken(data: RefreshTokenInput) {
  //   const payload = await jwtService.verifyRefreshToken(data.refreshToken)
  // }
}

export const authService = new AuthService();
