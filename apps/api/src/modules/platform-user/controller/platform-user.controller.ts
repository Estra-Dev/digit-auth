import type { Request, Response } from "express";
import { Types } from "mongoose";

import { AppError } from "../../../core/errors/AppError.js";
import { ApiResponse } from "../../../core/response/ApiResponse.js";
import { applicationService } from "../../application/service/application.service.js";
import { workspaceService } from "../../workspace/index.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { platformUserService } from "../service/platform-user.service.js";

async function getOwnedApplicationIds(req: Request) {
  if (!req.platformAccount) {
    throw new AppError("Authentication required.", 401, true);
  }

  const workspace = await workspaceService.getWorkspaceByOwnerId(
    req.platformAccount.id,
  );

  const applications = await applicationService.listApplications(workspace.id);

  return applications.map((application) => new Types.ObjectId(application.id));
}

export const listPlatformUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationIds = await getOwnedApplicationIds(req);
    const users = await platformUserService.listUsers(applicationIds);

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
      throw new AppError("Invalid user ID.", 400, true);
    }

    const applicationIds = await getOwnedApplicationIds(req);
    const user = await platformUserService.getUser(id, applicationIds);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Platform user retrieved successfully.",
      data: user,
    });
  },
);
