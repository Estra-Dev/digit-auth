import { ApiResponse } from "../core/response/ApiResponse.js";
import { parseRequest } from "../core/validation/parseRequest.js";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { type Request, type Response } from "express";
import { registerSchema } from "../validators/auth.validator.js";

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
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Token refreshed successfully.",
      data: result,
    });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  await authService.logout(refreshToken);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Logged Out Successfully",
    data: null,
  });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  await authService.logoutAll(refreshToken);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Logged Out from all Devices",
    data: null,
  });
});
