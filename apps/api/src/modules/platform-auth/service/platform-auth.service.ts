import { Types } from "mongoose";

import { AppError } from "../../../core/errors/AppError.js";

import { passwordService } from "../../../security/password/password.service.js";
import { platformJwtService } from "../../../security/platform-jwt/platform-jwt.service.js";
import { tokenHashService } from "../../../security/token/token-hash.service.js";

import { platformAccountRepository } from "../../platform-account/repository/platform-account.repository.js";
import { platformSessionRepository } from "../../platform-session/repository/platform-session.repository.js";

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
}

export const platformAuthService = new PlatformAuthService();
