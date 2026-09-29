import type { Request, Response } from "express";

import { ApiResponse } from "../../../core/response/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { platformSessionService } from "../service/platform-session.service.js";

export const listPlatformSessions = asyncHandler(
  async (_req: Request, res: Response) => {
    const sessions = await platformSessionService.listSessions();

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Platform sessions retrieved successfully.",
      data: sessions,
    });
  },
);
