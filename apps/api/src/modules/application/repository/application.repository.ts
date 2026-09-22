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
    return Application.findOne({
      clientId,
    });
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
    return Application.findOne({
      clientId,
    }).select("+clientSecretHash");
  }

  async create(data: {
    name: string;
    clientId: string;
    clientSecretHash: string;
  }): Promise<ApplicationDocument> {
    return Application.create({
      name: data.name,
      clientId: data.clientId,
      clientSecretHash: data.clientSecretHash,
    });
  }

  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<ApplicationDocument | null> {
    return Application.findByIdAndUpdate(
      applicationId,
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
}

export const applicationRepository = new ApplicationRepository();
