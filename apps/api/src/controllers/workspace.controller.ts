import type { Request, Response } from "express";

import { ApiResponse } from "../core/response/ApiResponse.js";
import { workspaceService } from "../modules/workspace/index.js";

export async function getCurrentWorkspace(req: Request, res: Response) {
  const workspace = await workspaceService.getWorkspaceByOwnerId(
    req.platformAccount!.id,
  );

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Workspace retrieved successfully.",
    data: {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        status: workspace.status,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      },
    },
  });
}
