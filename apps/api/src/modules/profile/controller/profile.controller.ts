import type { Request, Response } from "express";

import { ApiResponse } from "../../../core/response/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

import { profileService } from "../service/profile.service.js";

function getApplicationId(req: Request) {
  if (!req.application) {
    throw new Error("Application context is required");
  }

  return req.application._id;
}

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await profileService.updateProfile(
      getApplicationId(req),
      req.user!.id,
      req.body,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Profile updated successfully.",
      data: user,
    });
  },
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    await profileService.changePassword(
      getApplicationId(req),
      req.user!.id,
      req.body,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Password changed successfully.",
      data: null,
    });
  },
);

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    await profileService.deleteAccount(getApplicationId(req), req.user!.id);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Account deleted successfully.",
      data: null,
    });
  },
);
