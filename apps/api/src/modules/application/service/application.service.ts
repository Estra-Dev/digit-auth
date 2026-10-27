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

function generatePublishableKey(): string {
  return `dap_${crypto.randomBytes(24).toString("hex")}`;
}

function mapApplication(application: {
  id: string;
  name: string;
  clientId: string;
  status: ApplicationStatus;
  allowedOrigins: string[];
  webhookUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: application.id,
    name: application.name,
    clientId: application.clientId,
    status: application.status,
    allowedOrigins: application.allowedOrigins ?? [],
    webhookUrl: application.webhookUrl ?? null,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}

export class ApplicationService {
  async createApplication(workspaceId: string, name: string) {
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();
    const publishableKey = generatePublishableKey();

    const clientSecretHash = await passwordService.hash(clientSecret);

    const application = await applicationRepository.create({
      workspaceId,
      name,
      clientId,
      clientSecretHash,
      publishableKey,
    });

    return {
      application: mapApplication(application),
      credentials: {
        clientId,
        clientSecret,
      },
      publishableKey,
    };
  }

  async getActiveApplicationByPublishableKey(publishableKey: string) {
    const application =
      await applicationRepository.findActiveByPublishableKey(publishableKey);

    if (!application) {
      throw new AppError("Invalid or inactive application.", 401, true);
    }

    return application;
  }

  async listApplications(workspaceId: string) {
    const applications =
      await applicationRepository.findByWorkspaceId(workspaceId);

    return applications.map(mapApplication);
  }

  async getApplication(workspaceId: string, applicationId: string) {
    const application = await applicationRepository.findByIdInWorkspace(
      applicationId,
      workspaceId,
    );

    if (!application) {
      throw new AppError("Application not found.", 404, true);
    }

    return mapApplication(application);
  }

  async suspendApplication(workspaceId: string, applicationId: string) {
    const application = await applicationRepository.findByIdInWorkspace(
      applicationId,
      workspaceId,
    );

    if (!application) {
      throw new AppError("Application not found.", 404, true);
    }

    const updated = await applicationRepository.updateStatus(
      workspaceId,
      applicationId,
      ApplicationStatus.SUSPENDED,
    );

    if (!updated) {
      throw new AppError("Application not found.", 404, true);
    }

    return mapApplication(updated);
  }

  async activateApplication(workspaceId: string, applicationId: string) {
    const application = await applicationRepository.findByIdInWorkspace(
      applicationId,
      workspaceId,
    );

    if (!application) {
      throw new AppError("Application not found.", 404, true);
    }

    const updated = await applicationRepository.updateStatus(
      workspaceId,
      applicationId,
      ApplicationStatus.ACTIVE,
    );

    if (!updated) {
      throw new AppError("Application not found.", 404, true);
    }

    return mapApplication(updated);
  }

  async rotateClientSecret(workspaceId: string, applicationId: string) {
    const application = await applicationRepository.findByIdInWorkspace(
      applicationId,
      workspaceId,
    );

    if (!application) {
      throw new AppError("Application not found.", 404, true);
    }

    const clientSecret = generateClientSecret();

    const clientSecretHash = await passwordService.hash(clientSecret);

    const updated = await applicationRepository.updateClientSecretHash(
      workspaceId,
      applicationId,
      clientSecretHash,
    );

    if (!updated) {
      throw new AppError("Application not found.", 404, true);
    }

    return {
      application: mapApplication(updated),
      credentials: {
        clientId: updated.clientId,
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

  async authenticateApplication(clientId: string, clientSecret: string) {
    const application =
      await applicationRepository.findByClientIdWithSecret(clientId);

    if (!application) {
      throw new AppError("Invalid application credentials.", 401, true);
    }

    const validSecret = await passwordService.verify(
      application.clientSecretHash,
      clientSecret,
    );

    if (!validSecret) {
      throw new AppError("Invalid application credentials.", 401, true);
    }

    if (application.status !== ApplicationStatus.ACTIVE) {
      throw new AppError("Invalid or inactive application.", 401, true);
    }

    return application;
  }

  async updateApplicationAllowedOrigins(
    workspaceId: string,
    applicationId: string,
    allowedOrigins: string[],
  ) {
    const application = await applicationRepository.updateAllowedOrigins(
      workspaceId,
      applicationId,
      allowedOrigins,
    );

    if (!application) {
      throw new AppError("Application not found.", 404, true);
    }

    return mapApplication(application);
  }

  async updateWebhookConfiguration(
    workspaceId: string,
    applicationId: string,
    webhookUrl: string | null,
  ) {
    const application =
      await applicationRepository.findByIdInWorkspaceWithWebhookSecret(
        applicationId,
        workspaceId,
      );

    if (!application) {
      throw new AppError("Application not found.", 404, true);
    }

    let encryptedSecret = application.webhookSecretEncrypted ?? null;
    let signingSecret: string | undefined;

    if (webhookUrl !== null && !encryptedSecret) {
      const { generateWebhookSecret, encryptWebhookSecret } =
        await import("../../webhook/service/webhook-secret.service.js");

      signingSecret = generateWebhookSecret();
      encryptedSecret = encryptWebhookSecret(signingSecret);
    }

    const updated = await applicationRepository.updateWebhookConfiguration(
      workspaceId,
      applicationId,
      webhookUrl,
      encryptedSecret,
    );

    if (!updated) {
      throw new AppError("Application not found.", 404, true);
    }

    if (webhookUrl === null) {
      return {
        application: mapApplication(updated),
        webhook: {
          enabled: false,
          url: null,
        },
      };
    }

    return {
      application: mapApplication(updated),
      webhook: {
        enabled: true,
        url: updated.webhookUrl,
        ...(signingSecret ? { signingSecret } : {}),
      },
    };
  }
}

export const applicationService = new ApplicationService();
