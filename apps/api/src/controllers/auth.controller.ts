import { ApiResponse } from "../core/response/ApiResponse.js";
import { parseRequest } from "../core/validation/parseRequest.js";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { type Request, type Response } from "express";

import { registerSchema } from "../validators/auth.validator.js";
import { verifyEmailSchema } from "../validators/verify-email.schema.js";

type SessionParams = {
  id: string;
};

function getApplicationId(req: Request) {
  if (!req.application) {
    throw new Error("Application context is required");
  }

  return req.application._id;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const applicationId = getApplicationId(req);

  const body = parseRequest(registerSchema, req.body);

  const user = await authService.register(applicationId, body);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const applicationId = getApplicationId(req);

  const result = await authService.login(applicationId, req.body);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Login Successful.",
    data: result,
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getApplicationId(req);

    const result = await authService.refreshToken(applicationId, req.body);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Token refreshed successfully.",
      data: result,
    });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const applicationId = getApplicationId(req);

  await authService.logout(applicationId, req.body);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Logged Out Successfully",
    data: null,
  });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  const applicationId = getApplicationId(req);

  await authService.logoutAll(applicationId, req.body);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Logged Out from all Devices",
    data: null,
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const applicationId = getApplicationId(req);

  const body = parseRequest(verifyEmailSchema, req.body);

  await authService.verifyEmail(applicationId, body.token);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Email Verified Successfully",
    data: null,
  });
});

export const resendVerificationEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getApplicationId(req);

    const { email } = req.body;

    await authService.resendVerificationEmail(applicationId, email);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "If an account exists, a verification email sent.",
      data: null,
    });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getApplicationId(req);

    const { email } = req.body;

    const result = await authService.forgotPassword(applicationId, email);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "If an account exists, a password reset email has been sent.",
      data: result ?? null,
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getApplicationId(req);

    await authService.resetPassword(applicationId, req.body);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Password reset successfully.",
      data: null,
    });
  },
);

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Current user retrieved successfully.",
      data: req.user!,
    });
  },
);

export const getMySessions = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getApplicationId(req);

    const sessions = await authService.getMySessions(
      applicationId,
      req.user!.id,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Sessions retrieved successfully.",
      data: sessions,
    });
  },
);

export const revokeSession = asyncHandler(
  async (req: Request<SessionParams>, res: Response) => {
    const applicationId = getApplicationId(req);

    await authService.revokeSession(applicationId, req.user!.id, req.params.id);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Session revoked successfully.",
      data: null,
    });
  },
);

export const revokeOtherSessions = asyncHandler(
  async (req: Request<{}, {}, { refreshToken: string }>, res: Response) => {
    const applicationId = getApplicationId(req);

    await authService.revokeOtherSessions(
      applicationId,
      req.user!.id,
      req.body.refreshToken,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Other sessions revoked successfully.",
      data: null,
    });
  },
);
