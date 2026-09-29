import type { Request, Response } from "express";

import { ApiResponse } from "../../../core/response/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
  platformUserService,
} from "../service/platform-user.service.js";

export const listPlatformUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users =
      await platformUserService.listUsers();

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Platform users retrieved successfully.",
      data: users,
    });
  },
);

export const getPlatformUser = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;

    if (typeof id !== "string") {
      throw new Error("Invalid user ID");
    }

    const user =
      await platformUserService.getUser(id);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Platform user retrieved successfully.",
      data: user,
    });
  },
);
