import { Workspace, type WorkspaceDocument } from "../model/workspace.model.js";

export class WorkspaceRepository {
  async findById(id: string): Promise<WorkspaceDocument | null> {
    return Workspace.findById(id);
  }

  async findByOwnerId(ownerId: string): Promise<WorkspaceDocument | null> {
    return Workspace.findOne({ ownerId });
  }

  async create(data: {
    name: string;
    ownerId: string;
  }): Promise<WorkspaceDocument> {
    return Workspace.create({
      name: data.name,
      ownerId: data.ownerId,
    });
  }
}

export const workspaceRepository = new WorkspaceRepository();
