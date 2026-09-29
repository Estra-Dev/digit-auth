import { AppError } from "../../../core/errors/AppError.js";
import { workspaceRepository } from "../repository/workspace.repository.js";

export class WorkspaceService {
  async createWorkspace(ownerId: string, name: string) {
    const existing = await workspaceRepository.findByOwnerId(ownerId);

    if (existing) {
      throw new AppError(
        "Platform account already has a workspace.",
        409,
        true,
      );
    }

    return workspaceRepository.create({
      ownerId,
      name,
    });
  }

  async getWorkspaceByOwnerId(ownerId: string) {
    const workspace = await workspaceRepository.findByOwnerId(ownerId);

    if (!workspace) {
      throw new AppError("Workspace not found.", 404, true);
    }

    return workspace;
  }
}

export const workspaceService = new WorkspaceService();
