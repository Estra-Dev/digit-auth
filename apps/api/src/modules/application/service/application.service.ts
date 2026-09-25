import crypto from "node:crypto";

import { AppError } from "../../../core/errors/AppError.js";
import { passwordService } from "../../../security/password/password.service.js";
import { applicationRepository } from "../repository/application.repository.js";
import { ApplicationStatus } from "../types/application.types.js";

function generateClientId(): string {
  return `da_${crypto.randomBytes(16).toString("hex")}`;
}

function generateClientSecret(): string {
  return `das_${crypto.randomBytes(32).toString("hex")}`;
}

function mapApplication(application: {
  id: string;
  name: string;
  clientId: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: application.id,
    name: application.name,
    clientId: application.clientId,
    status: application.status,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}

export class ApplicationService {
  async createApplication(name: string) {
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();

    const clientSecretHash = await passwordService.hash(clientSecret);

    const application = await applicationRepository.create({
      name,
      clientId,
      clientSecretHash,
    });

    return {
      application: mapApplication(application),
      credentials: {
        clientId,
        clientSecret,
      },
    };
  }

  async listApplications() {
    const applications = await applicationRepository.findAll();

    return applications.map(mapApplication);
  }

  async getApplication(applicationId: string) {
    const application = await applicationRepository.findById(applicationId);

    if (!application) {
      throw new AppError("Application not found.", 404, true);
    }

    return mapApplication(application);
  }

  async suspendApplication(applicationId: string) {
    const application = await applicationRepository.updateStatus(
      applicationId,
      ApplicationStatus.SUSPENDED,
    );

    if (!application) {
      throw new AppError("Application not found.", 404, true);
    }

    return mapApplication(application);
  }

  async activateApplication(applicationId: string) {
    const application = await applicationRepository.updateStatus(
      applicationId,
      ApplicationStatus.ACTIVE,
    );

    if (!application) {
      throw new AppError("Application not found.", 404, true);
    }

    return mapApplication(application);
  }

  async rotateClientSecret(applicationId: string) {
    const application = await applicationRepository.findById(applicationId);

    if (!application) {
      throw new AppError("Application not found.", 404, true);
    }

    const clientSecret = generateClientSecret();

    const clientSecretHash = await passwordService.hash(clientSecret);

    await applicationRepository.updateClientSecretHash(
      applicationId,
      clientSecretHash,
    );

    return {
      application: mapApplication(application),
      credentials: {
        clientId: application.clientId,
        clientSecret,
      },
    };
  }

  async getActiveApplication(clientId: string) {
    const application =
      await applicationRepository.findActiveByClientId(clientId);

    if (!application) {
      throw new AppError("Invalid or inactive application.", 401, true);
    }

    return application;
  }
}

export const applicationService = new ApplicationService();
