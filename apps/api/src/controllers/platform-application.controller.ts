import type { Request, Response } from "express";

import { ApiResponse } from "../core/response/ApiResponse.js";
import { applicationService } from "../modules/application/service/application.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import type {
  CreatePlatformApplicationInput,
  PlatformApplicationIdInput,
} from "../validators/platform-application.validator.js";

export const createPlatformApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as CreatePlatformApplicationInput;

    const result = await applicationService.createApplication(body.name);

    return ApiResponse.success(res, {
      statusCode: 201,
      message: "Application created successfully.",
      data: result,
    });
  },
);

export const listPlatformApplications = asyncHandler(
  async (_req: Request, res: Response) => {
    const applications = await applicationService.listApplications();

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Applications retrieved successfully.",
      data: applications,
    });
  },
);

export const getPlatformApplication = asyncHandler(
  async (req: Request<PlatformApplicationIdInput>, res: Response) => {
    const application = await applicationService.getApplication(req.params.id);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Application retrieved successfully.",
      data: application,
    });
  },
);

export const suspendPlatformApplication = asyncHandler(
  async (req: Request<PlatformApplicationIdInput>, res: Response) => {
    const application = await applicationService.suspendApplication(
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
    const application = await applicationService.activateApplication(
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
    const result = await applicationService.rotateClientSecret(req.params.id);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Application client secret rotated successfully.",
      data: result,
    });
  },
);
