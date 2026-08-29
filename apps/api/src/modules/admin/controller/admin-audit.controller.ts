import type { Request, Response } from "express";

import { ApiResponse } from "../../../core/response/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

import { adminAuditService } from "../service/admin-audit.service.js";

export const listAuditLogs = asyncHandler(
  async (_req: Request, res: Response) => {
    const logs = await adminAuditService.listLogs();

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Audit logs retrieved successfully.",
      data: logs,
    });
  },
);
