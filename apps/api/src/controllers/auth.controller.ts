import { ApiResponse } from "../core/response/ApiResponse.js";
import { parseRequest } from "../core/validation/parseRequest.js";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { type Request, type Response } from "express";
import { registerSchema } from "../validators/auth.validator.js";
import { logoutSchema } from "../validators/logout.schema.js";
import { UserMapper } from "../modules/auth/mapper/user.mapper.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = parseRequest(registerSchema, req.body);

  const user = await authService.register(body);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Login Successful.",
    data: result,
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    // const { refreshToken } = req.body;

    const result = await authService.refreshToken(req.body);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Token refreshed successfully.",
      data: result,
    });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // const { refreshToken } = req.body;
  const body = parseRequest(logoutSchema, req.body);

  await authService.logout(body);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Logged Out Successfully",
    data: null,
  });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  // const { refreshToken } = req.body;
  const body = parseRequest(logoutSchema, req.body);

  await authService.logoutAll(body);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Logged Out from all Devices",
    data: null,
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  await authService.verifyEmail(token);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Email Verified Successfully",
    data: null,
  });
});

export const resendVerificationEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.resendVerificationEmail(email);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "If an account exists, a verification email sent.",
      data: null,
    });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "If an account exists, a password reset email has been sent.",
      data: null,
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Password reset successfully.",
      data: null,
    });
  },
);

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    // const user = await authService.getCurrentUser(req.user!.id);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Current user retrieved successfully.",
      data: req.user!,
    });
  },
);
