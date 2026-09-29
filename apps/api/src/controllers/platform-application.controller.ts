import type { Request, Response } from "express";

import { ApiResponse } from "../core/response/ApiResponse.js";
import { applicationService } from "../modules/application/service/application.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../core/errors/AppError.js";

import type {
  CreatePlatformApplicationInput,
  PlatformApplicationIdInput,
} from "../validators/platform-application.validator.js";
import { workspaceService } from "../modules/workspace/index.js";

export const createPlatformApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as CreatePlatformApplicationInput;

    if (!req.platformAccount) {
      throw new AppError("Platform authentication is required.", 401, true);
    }

    const workspace = await workspaceService.getWorkspaceByOwnerId(
      req.platformAccount.id,
    );

    const result = await applicationService.createApplication(
      workspace.id,
      body.name,
    );

    return ApiResponse.success(res, {
      statusCode: 201,
      message: "Application created successfully.",
      data: result,
    });
  },
);

export const listPlatformApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const workspace = await workspaceService.getWorkspaceByOwnerId(
      req.platformAccount!.id,
    );

    const applications = await applicationService.listApplications(
      workspace.id,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Applications retrieved successfully.",
      data: applications,
    });
  },
);

export const getPlatformApplication = asyncHandler(
  async (req: Request<PlatformApplicationIdInput>, res: Response) => {
    const workspace = await workspaceService.getWorkspaceByOwnerId(
      req.platformAccount!.id,
    );

    const application = await applicationService.getApplication(
      workspace.id,
      req.params.id,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Application retrieved successfully.",
      data: application,
    });
  },
);

export const suspendPlatformApplication = asyncHandler(
  async (req: Request<PlatformApplicationIdInput>, res: Response) => {
    const workspace = await workspaceService.getWorkspaceByOwnerId(
      req.platformAccount!.id,
    );

    const application = await applicationService.suspendApplication(
      workspace.id,
      req.params.id,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Application suspended successfully.",
      data: application,
    });
  },
);

export const activatePlatformApplication = asyncHandler(
  async (req: Request<PlatformApplicationIdInput>, res: Response) => {
    const workspace = await workspaceService.getWorkspaceByOwnerId(
      req.platformAccount!.id,
    );

    const application = await applicationService.activateApplication(
      workspace.id,
      req.params.id,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Application activated successfully.",
      data: application,
    });
  },
);

export const rotatePlatformApplicationSecret = asyncHandler(
  async (req: Request<PlatformApplicationIdInput>, res: Response) => {
    const workspace = await workspaceService.getWorkspaceByOwnerId(
      req.platformAccount!.id,
    );

    const result = await applicationService.rotateClientSecret(
      workspace.id,
      req.params.id,
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Application client secret rotated successfully.",
      data: result,
    });
  },
);
