import crypto from "node:crypto";

import { AppError } from "../../../core/errors/AppError.js";
import { passwordService } from "../../../security/password/password.service.js";
import { applicationRepository } from "../repository/application.repository.js";

function generateClientId(): string {
  return `da_${crypto.randomBytes(16).toString("hex")}`;
}

function generateClientSecret(): string {
  return `das_${crypto.randomBytes(32).toString("hex")}`;
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
      application: {
        id: application.id,
        name: application.name,
        clientId: application.clientId,
        status: application.status,
        createdAt: application.createdAt,
      },
      credentials: {
        clientId,
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
