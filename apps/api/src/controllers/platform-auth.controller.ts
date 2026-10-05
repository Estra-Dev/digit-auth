import type { Request, Response } from "express";

import { ApiResponse } from "../core/response/ApiResponse.js";
import { platformAuthService } from "../modules/platform-auth/service/platform-auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import type {
  PlatformRegisterInput,
  PlatformLoginInput,
  PlatformRefreshTokenInput,
  PlatformLogoutInput,
  PlatformResendVerificationEmailInput,
  PlatformForgotPasswordInput,
  PlatformResetPasswordInput,
  PlatformChangePasswordInput,
} from "../validators/platform-auth.validator.js";

type SessionParams = {
  id: string;
};

export const platformRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as PlatformRegisterInput;

    const result = await platformAuthService.register(
      body.email,
      body.password,
    );

    return ApiResponse.success(res, {
      statusCode: 201,
      message: "Account created successfully.",
      data: result,
    });
  },
);

export const resendPlatformVerificationEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as PlatformResendVerificationEmailInput;
    await platformAuthService.resendVerificationEmail(body.email);
    return ApiResponse.success(res, {
      statusCode: 200,
      message:
        "If an unverified account exists for this email, a verification email has been sent.",
      data: null,
    });
  },
);

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

export const forgotPlatformPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as PlatformForgotPasswordInput;

    const result = await platformAuthService.forgotPassword(body.email);

    return ApiResponse.success(res, {
      statusCode: 200,
      message:
        "If an account exists for this email, a password reset link has been sent.",
      data: result ?? null,
    });
  },
);

export const resetPlatformPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as PlatformResetPasswordInput;

    await platformAuthService.resetPassword(body.token, body.password);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Password reset successfully. Please log in again.",
      data: null,
    });
  },
);

export const changePlatformPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as PlatformChangePasswordInput;

    await platformAuthService.changePassword(
      req.platformAccount!.id,
      body.currentPassword,
      body.newPassword,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Password changed successfully. Please log in again.",
      data: null,
    });
  },
);
