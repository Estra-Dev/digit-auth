import type { Request, Response } from "express";

import { ApiResponse } from "../../../core/response/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { adminSecurityEventService } from "../service/admin-security-event.service.js";

function getParam(req: Request, name: string): string {
  const value = req.params[name];

  if (typeof value !== "string") {
    throw new Error(`Invalid ${name}`);
  }

  return value;
}

export const listSecurityEvents = asyncHandler(
  async (_req: Request, res: Response) => {
    const events = await adminSecurityEventService.listEvents();

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Security events retrieved successfully.",
      data: events,
    });
  },
);

export const getUserSecurityEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getParam(req, "userId");

    const events = await adminSecurityEventService.getUserEvents(userId);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "User security events retrieved successfully.",
      data: events,
    });
  },
);
