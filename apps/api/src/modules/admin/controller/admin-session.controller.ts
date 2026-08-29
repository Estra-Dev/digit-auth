import type { Request, Response } from "express";

import { ApiResponse } from "../../../core/response/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

import { adminSessionService } from "../service/admin-session.service.js";

function getParam(req: Request, name: string): string {
  const value = req.params[name];

  if (typeof value !== "string") {
    throw new Error(`Invalid ${name}`);
  }

  return value;
}

export const getUserSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getParam(req, "userId");

    const sessions = await adminSessionService.getUserSessions(userId);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "User sessions retrieved successfully.",
      data: sessions,
    });
  },
);

export const revokeUserSession = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getParam(req, "userId");
    const sessionId = getParam(req, "sessionId");

    await adminSessionService.revokeUserSession(userId, sessionId);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "User session revoked successfully.",
      data: null,
    });
  },
);

export const revokeAllUserSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getParam(req, "userId");

    await adminSessionService.revokeAllUserSessions(userId);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "All user sessions revoked successfully.",
      data: null,
    });
  },
);
