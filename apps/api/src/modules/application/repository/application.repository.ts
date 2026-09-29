import {
  Application,
  type ApplicationDocument,
} from "../model/application.model.js";
import { ApplicationStatus } from "../types/application.types.js";

export class ApplicationRepository {
  async findById(applicationId: string): Promise<ApplicationDocument | null> {
    return Application.findById(applicationId);
  }

  async findByClientId(clientId: string): Promise<ApplicationDocument | null> {
    return Application.findOne({ clientId });
  }

  async findActiveByClientId(
    clientId: string,
  ): Promise<ApplicationDocument | null> {
    return Application.findOne({
      clientId,
      status: ApplicationStatus.ACTIVE,
    });
  }

  async findByClientIdWithSecret(
    clientId: string,
  ): Promise<ApplicationDocument | null> {
    return Application.findOne({ clientId }).select("+clientSecretHash");
  }

  async findAll(): Promise<ApplicationDocument[]> {
    return Application.find().sort({ createdAt: -1 });
  }

  async findByWorkspaceId(workspaceId: string): Promise<ApplicationDocument[]> {
    return Application.find({
      workspaceId,
    }).sort({ createdAt: -1 });
  }

  async findByIdInWorkspace(
    applicationId: string,
    workspaceId: string,
  ): Promise<ApplicationDocument | null> {
    return Application.findOne({
      _id: applicationId,
      workspaceId,
    });
  }

  async create(data: {
    workspaceId: string;
    name: string;
    clientId: string;
    clientSecretHash: string;
  }): Promise<ApplicationDocument> {
    return Application.create({
      workspaceId: data.workspaceId,
      name: data.name,
      clientId: data.clientId,
      clientSecretHash: data.clientSecretHash,
    });
  }

  async updateStatus(
    workspaceId: string,
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<ApplicationDocument | null> {
    return Application.findOneAndUpdate(
      {
        _id: applicationId,
        workspaceId,
      },
      { status },
      { new: true, runValidators: true },
    );
  }

  async updateClientSecretHash(
    workspaceId: string,
    applicationId: string,
    clientSecretHash: string,
  ): Promise<ApplicationDocument | null> {
    return Application.findOneAndUpdate(
      {
        _id: applicationId,
        workspaceId,
      },
      { clientSecretHash },
      { new: true, runValidators: true },
    ).select("+clientSecretHash");
  }
}

export const applicationRepository = new ApplicationRepository();
