import type { Request, Response } from "express";

import { ApiResponse } from "../core/response/ApiResponse.js";
import { platformAuthService } from "../modules/platform-auth/service/platform-auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import type {
  PlatformLoginInput,
  PlatformRefreshTokenInput,
  PlatformLogoutInput,
} from "../validators/platform-auth.validator.js";

type SessionParams = {
  id: string;
};

export const platformLogin = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as PlatformLoginInput;

    const result = await platformAuthService.login(body.email, body.password, {
      userAgent: req.get("user-agent") ?? null,
      ipAddress: req.ip ?? null,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Platform login successful.",
      data: result,
    });
  },
);

export const platformRefreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as PlatformRefreshTokenInput;

    const result = await platformAuthService.refreshToken(body.refreshToken, {
      userAgent: req.get("user-agent") ?? null,
      ipAddress: req.ip ?? null,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Platform token refreshed successfully.",
      data: result,
    });
  },
);

export const platformLogout = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as PlatformLogoutInput;

    await platformAuthService.logout(body.refreshToken);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Platform logout successful.",
      data: null,
    });
  },
);

export const platformLogoutAll = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as PlatformLogoutInput;

    await platformAuthService.logoutAll(body.refreshToken);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Logged out from all platform sessions.",
      data: null,
    });
  },
);

export const getPlatformAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const account = req.platformAccount!;

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Platform account retrieved successfully.",
      data: {
        id: account.id,
        email: account.email,
        emailVerified: account.emailVerified,
        status: account.status,
        createdAt: account.createdAt,
      },
    });
  },
);

export const getPlatformSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const account = req.platformAccount!;

    const sessions = await platformAuthService.getSessions(account._id);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Platform sessions retrieved successfully.",
      data: sessions.map((session) => ({
        id: session.id,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        expiresAt: session.expiresAt,
        lastUsedAt: session.lastUsedAt,
        createdAt: session.createdAt,
        current: session.id === req.platformSessionId,
      })),
    });
  },
);

export const revokePlatformSession = asyncHandler(
  async (req: Request<SessionParams>, res: Response) => {
    const account = req.platformAccount!;

    await platformAuthService.revokeSession(account._id, req.params.id);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Platform session revoked successfully.",
      data: null,
    });
  },
);

export const revokeOtherPlatformSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const account = req.platformAccount!;
    const currentSessionId = req.platformSessionId!;

    await platformAuthService.revokeOtherSessions(
      account._id,
      currentSessionId,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Other platform sessions revoked successfully.",
      data: null,
    });
  },
);
