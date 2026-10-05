import mongoose, { Types } from "mongoose";

import { AppError } from "../../../core/errors/AppError.js";

import { passwordService } from "../../../security/password/password.service.js";
import { platformJwtService } from "../../../security/platform-jwt/platform-jwt.service.js";
import { tokenHashService } from "../../../security/token/token-hash.service.js";

import { platformAccountRepository } from "../../platform-account/repository/platform-account.repository.js";
import { platformSessionRepository } from "../../platform-session/repository/platform-session.repository.js";
import { workspaceService } from "../../workspace/service/workspace.service.js";
import { emailVerificationService } from "../../email-verification/index.js";
// import { passwordResetTokenService } from "../../../security/password-reset-token/password-reset-token.service.js";
import { tokenService } from "../../../security/index.js";
import { platformPasswordResetRepository } from "../../platform-password-reset/index.js";

import { emailService } from "../../email/index.js";
import { config } from "../../../config/index.js";

export type PlatformLoginContext = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

const PLATFORM_REFRESH_SESSION_DAYS = 30;

function getRefreshSessionExpiry(): Date {
  return new Date(
    Date.now() + PLATFORM_REFRESH_SESSION_DAYS * 24 * 60 * 60 * 1000,
  );
}

export class PlatformAuthService {
  async register(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingAccount =
      await platformAccountRepository.findByEmail(normalizedEmail);

    if (existingAccount) {
      throw new AppError(
        "An account with this email already exists.",
        409,
        true,
      );
    }

    const passwordHashed = await passwordService.hash(password);

    const account = await platformAccountRepository.create({
      email: normalizedEmail,
      passwordHashed,
      emailVerified: false,
    });

    try {
      const workspace = await workspaceService.createWorkspace(
        account.id,
        "My Workspace",
      );

      const verification =
        await emailVerificationService.createVerificationToken(account.id);

      await emailService.sendVerificationEmail({
        email: account.email,
        verificationToken: verification.token,
      });

      return {
        account: {
          id: account.id,
          email: account.email,
          emailVerified: account.emailVerified,
          status: account.status,
          createdAt: account.createdAt,
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          status: workspace.status,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      };
    } catch (error) {
      await platformAccountRepository.deleteById(account.id);

      throw error;
    }
  }

  async login(
    email: string,
    password: string,
    context: PlatformLoginContext = {},
  ) {
    const account =
      await platformAccountRepository.findByEmailWithPassword(email);

    if (!account) {
      throw new AppError("Invalid Email or Password", 401, true);
    }

    if (account.lockedUntil && account.lockedUntil.getTime() > Date.now()) {
      throw new AppError(
        "Account temporarily locked. Please try again later.",
        423,
        true,
      );
    }

    if (account.status !== "ACTIVE") {
      throw new AppError("Account is inactive", 403, true);
    }

    const validPassword = await passwordService.verify(
      account.passwordHashed,
      password,
    );

    if (!validPassword) {
      const updatedAccount =
        await platformAccountRepository.incrementFailedLoginAttempts(
          account.id,
        );

      const attempts = updatedAccount?.failedLoginAttempts ?? 0;

      if (attempts >= 5) {
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);

        await platformAccountRepository.lockAccount(account.id, lockedUntil);

        throw new AppError(
          "Account locked due to too many failed login attempts.",
          423,
          true,
        );
      }

      throw new AppError("Invalid Email or Password", 401, true);
    }

    await platformAccountRepository.resetFailedLoginAttempts(account.id);

    if (!account.emailVerified) {
      throw new AppError(
        "Please verify your email before logging in.",
        403,
        true,
      );
    }

    const sessionId = new Types.ObjectId().toString();

    const payload = {
      sub: account.id,
      email: account.email,
      sessionId,
      tokenType: "platform" as const,
    };

    const accessToken = await platformJwtService.generateAccessToken(payload);

    const refreshToken = await platformJwtService.generateRefreshToken(payload);

    const refreshTokenHash = tokenHashService.hash(refreshToken);

    const expiresAt = getRefreshSessionExpiry();

    await platformSessionRepository.create({
      sessionId,
      platformAccountId: account._id,
      refreshTokenHash,
      userAgent: context.userAgent ?? null,
      ipAddress: context.ipAddress ?? null,
      expiresAt,
    });

    return {
      account: {
        id: account.id,
        email: account.email,
        emailVerified: account.emailVerified,
        status: account.status,
        createdAt: account.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  private async sendPasswordResetEmail(account: {
    id: string;
    email: string;
  }): Promise<string> {
    const resetToken = tokenService.generatePasswordResetToken();

    const resetTokenHash = tokenHashService.hash(resetToken);

    await platformPasswordResetRepository.deleteByAccountId(account.id);

    await platformPasswordResetRepository.create({
      platformAccountId: account.id,
      tokenHash: resetTokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    try {
      await emailService.sendPlatformPasswordResetEmail({
        email: account.email,
        resetToken,
      });
    } catch (error) {
      await platformPasswordResetRepository
        .deleteByAccountId(account.id)
        .catch(() => undefined);

      throw error;
    }

    return resetToken;
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const account =
      await platformAccountRepository.findByEmail(normalizedEmail);

    /*
     * Always return the same result for unknown accounts.
     * This prevents account enumeration.
     */
    if (!account) {
      return;
    }

    /*
     * Password reset should only be issued for verified
     * platform accounts.
     */
    if (!account.emailVerified) {
      return;
    }

    const resetToken = await this.sendPasswordResetEmail({
      id: account.id,
      email: account.email,
    });

    if (config.isTest) {
      return {
        resetToken,
      };
    }

    return;
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const tokenHash = tokenHashService.hash(token);

      const resetToken =
        await platformPasswordResetRepository.findByTokenHash(tokenHash);

      if (!resetToken) {
        throw new AppError("Invalid or expired token.", 400, true);
      }

      if (resetToken.expiresAt.getTime() <= Date.now()) {
        throw new AppError("Invalid or expired token.", 400, true);
      }

      const account = await platformAccountRepository.findById(
        resetToken.platformAccountId.toString(),
      );

      if (!account) {
        throw new AppError("Invalid or expired token.", 400, true);
      }

      const passwordHashed = await passwordService.hash(password);

      const updatedAccount = await platformAccountRepository.updatePassword(
        account.id,
        passwordHashed,
        session,
      );

      if (!updatedAccount) {
        throw new AppError("Unable to reset password.", 400, true);
      }

      await platformPasswordResetRepository.deleteById(resetToken.id, session);

      /*
       * A password reset invalidates every existing
       * platform session.
       */
      await platformSessionRepository.deleteByAccountId(account._id, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async refreshToken(
    refreshToken: string,
    _context: PlatformLoginContext = {},
  ) {
    let payload;

    try {
      payload = await platformJwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    const session = await platformSessionRepository.findByIdWithRefreshToken(
      payload.sessionId,
    );

    if (!session) {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    if (session.platformAccountId.toString() !== payload.sub) {
      throw new AppError("Invalid authentication context.", 401, true);
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await platformSessionRepository.deleteById(payload.sessionId);

      throw new AppError("Refresh Token expired.", 401, true);
    }

    const refreshTokenHash = tokenHashService.hash(refreshToken);

    if (refreshTokenHash !== session.refreshTokenHash) {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    const account = await platformAccountRepository.findById(payload.sub);

    if (!account) {
      throw new AppError("Platform account not found.", 404, true);
    }

    if (account.status !== "ACTIVE") {
      throw new AppError("Account is inactive", 403, true);
    }

    const newPayload = {
      sub: account.id,
      email: account.email,
      sessionId: payload.sessionId,
      tokenType: "platform" as const,
    };

    const newAccessToken =
      await platformJwtService.generateAccessToken(newPayload);

    const newRefreshToken =
      await platformJwtService.generateRefreshToken(newPayload);

    const newRefreshTokenHash = tokenHashService.hash(newRefreshToken);

    const newExpiresAt = getRefreshSessionExpiry();

    await platformSessionRepository.updateRefreshToken(
      payload.sessionId,
      newRefreshTokenHash,
      newExpiresAt,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    let payload;

    try {
      payload = await platformJwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    const session = await platformSessionRepository.findByIdWithRefreshToken(
      payload.sessionId,
    );

    if (!session) {
      return;
    }

    const refreshTokenHash = tokenHashService.hash(refreshToken);

    if (refreshTokenHash !== session.refreshTokenHash) {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    await platformSessionRepository.deleteById(payload.sessionId);
  }

  async logoutAll(refreshToken: string) {
    let payload;

    try {
      payload = await platformJwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    const session = await platformSessionRepository.findByIdWithRefreshToken(
      payload.sessionId,
    );

    if (!session) {
      return;
    }

    const refreshTokenHash = tokenHashService.hash(refreshToken);

    if (refreshTokenHash !== session.refreshTokenHash) {
      throw new AppError("Invalid Refresh Token", 401, true);
    }

    await platformSessionRepository.deleteByAccountId(
      session.platformAccountId,
    );
  }

  async getSessions(platformAccountId: Types.ObjectId) {
    return platformSessionRepository.findByAccountId(platformAccountId);
  }

  async revokeSession(platformAccountId: Types.ObjectId, sessionId: string) {
    const session = await platformSessionRepository.findById(sessionId);

    if (!session) {
      throw new AppError("Session not found.", 404, true);
    }

    if (session.platformAccountId.toString() !== platformAccountId.toString()) {
      throw new AppError("Invalid session ownership.", 403, true);
    }

    await platformSessionRepository.deleteById(sessionId);
  }

  async revokeOtherSessions(
    platformAccountId: Types.ObjectId,
    currentSessionId: string,
  ) {
    await platformSessionRepository.deleteOtherSessions(
      platformAccountId,
      currentSessionId,
    );
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    const account =
      await platformAccountRepository.findByEmail(normalizedEmail);

    /*
     * Always return successfully for unknown accounts.
     * This prevents email/account enumeration.
     */
    if (!account) {
      return;
    }

    /*
     * A verified account does not need another verification email.
     * Keep the response identical to the unknown-account case.
     */
    if (account.emailVerified) {
      return;
    }

    const verification = await emailVerificationService.createVerificationToken(
      account.id,
    );

    try {
      await emailService.sendVerificationEmail({
        email: account.email,
        verificationToken: verification.token,
      });
    } catch (error) {
      /*
       * Do not leave an active token behind when email delivery fails.
       */
      await emailVerificationService
        .deleteActiveVerificationTokens(account.id)
        .catch(() => undefined);

      throw error;
    }
  }

  async changePassword(
    accountId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const account =
      await platformAccountRepository.findByIdWithPassword(accountId);

    if (!account) {
      throw new AppError("Account not found.", 404, true);
    }

    const isCurrentPasswordValid = await passwordService.verify(
      account.passwordHashed,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect.", 400, true);
    }

    const passwordHashed = await passwordService.hash(newPassword);

    const updatedAccount = await platformAccountRepository.updatePassword(
      accountId,
      passwordHashed,
    );

    if (!updatedAccount) {
      throw new AppError("Unable to change password.", 400, true);
    }

    await platformSessionRepository.deleteByAccountId(
      new Types.ObjectId(accountId),
    );
  }
}

export const platformAuthService = new PlatformAuthService();
