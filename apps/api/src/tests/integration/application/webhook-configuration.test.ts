import { Types } from "mongoose";
import { afterEach, describe, expect, it } from "vitest";

import { Application } from "../../../modules/application/model/application.model.js";
import { applicationRepository } from "../../../modules/application/index.js";
import { applicationService } from "../../../modules/application/index.js";
import { decryptWebhookSecret } from "../../../modules/webhook/service/webhook-secret.service.js";
import { workspaceRepository } from "../../../modules/workspace/index.js";

const createdApplicationIds: string[] = [];

afterEach(async () => {
  if (createdApplicationIds.length > 0) {
    await Application.deleteMany({
      _id: { $in: createdApplicationIds },
    });
    createdApplicationIds.length = 0;
  }
});

async function createTestApplication(name = "Webhook Test Application") {
  const ownerId = new Types.ObjectId();

  const workspace = await workspaceRepository.create({
    ownerId: ownerId.toString(),
    name: `${name} Workspace`,
  });

  const created = await applicationService.createApplication(
    workspace.id,
    name,
  );

  createdApplicationIds.push(created.application.id);

  return { workspace, application: created.application };
}

describe("Application webhook configuration", () => {
  it("creates a webhook and returns its signing secret once", async () => {
    const { workspace, application } = await createTestApplication();

    const result = await applicationService.updateWebhookConfiguration(
      workspace.id,
      application.id,
      "https://example.com/webhooks/digit-auth",
    );

    expect(result.webhook.enabled).toBe(true);
    expect(result.webhook.url).toBe("https://example.com/webhooks/digit-auth");
    expect(result.webhook.signingSecret).toBeTruthy();

    const stored = await Application.findById(application.id).select(
      "+webhookSecretEncrypted",
    );

    expect(stored?.webhookSecretEncrypted).toBeTruthy();
    expect(stored?.webhookSecretEncrypted).not.toBe(
      result.webhook.signingSecret,
    );
    expect(decryptWebhookSecret(stored!.webhookSecretEncrypted!)).toBe(
      result.webhook.signingSecret,
    );

    const ordinaryQuery = await applicationRepository.findById(application.id);

    expect(ordinaryQuery).not.toBeNull();
    expect(ordinaryQuery!.get("webhookSecretEncrypted")).toBeUndefined();

    expect(result.application).not.toHaveProperty("webhookSecretEncrypted");
  });

  it("preserves the signing secret when the URL changes", async () => {
    const { workspace, application } = await createTestApplication();

    const first = await applicationService.updateWebhookConfiguration(
      workspace.id,
      application.id,
      "https://example.com/first",
    );

    const second = await applicationService.updateWebhookConfiguration(
      workspace.id,
      application.id,
      "https://example.com/second",
    );

    expect(first.webhook.signingSecret).toBeTruthy();
    expect(second.webhook.url).toBe("https://example.com/second");
    expect(second.webhook).not.toHaveProperty("signingSecret");

    const stored = await Application.findById(application.id).select(
      "+webhookSecretEncrypted",
    );

    expect(decryptWebhookSecret(stored!.webhookSecretEncrypted!)).toBe(
      first.webhook.signingSecret,
    );
  });

  it("disables the webhook while preserving its signing secret", async () => {
    const { workspace, application } = await createTestApplication();

    const configured = await applicationService.updateWebhookConfiguration(
      workspace.id,
      application.id,
      "https://example.com/webhooks/digit-auth",
    );

    const disabled = await applicationService.updateWebhookConfiguration(
      workspace.id,
      application.id,
      null,
    );

    expect(disabled.webhook).toEqual({
      enabled: false,
      url: null,
    });

    const stored = await Application.findById(application.id).select(
      "+webhookSecretEncrypted",
    );

    expect(stored?.webhookUrl).toBeNull();
    expect(decryptWebhookSecret(stored!.webhookSecretEncrypted!)).toBe(
      configured.webhook.signingSecret,
    );
  });

  it("does not allow another workspace to configure the webhook", async () => {
    const { application } = await createTestApplication();

    const otherOwnerId = new Types.ObjectId();
    const otherWorkspace = await workspaceRepository.create({
      ownerId: otherOwnerId.toString(),
      name: "Other Workspace",
    });

    await expect(
      applicationService.updateWebhookConfiguration(
        otherWorkspace.id,
        application.id,
        "https://attacker.example.com/webhook",
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
    });

    const unchanged = await Application.findById(application.id);

    expect(unchanged?.webhookUrl).toBeNull();
  });

  it("rotates the signing secret and preserves the webhook URL", async () => {
    const { workspace, application } = await createTestApplication();

    const url = "https://example.com/webhooks/digit-auth";

    const configured = await applicationService.updateWebhookConfiguration(
      workspace.id,
      application.id,
      url,
    );

    const originalSecret = configured.webhook.signingSecret!;

    const rotated = await applicationService.rotateWebhookSigningSecret(
      workspace.id,
      application.id,
    );

    expect(rotated.signingSecret).toBeTruthy();
    expect(rotated.signingSecret).not.toBe(originalSecret);
    expect(rotated.application.webhookUrl).toBe(url);

    const stored = await Application.findById(application.id).select(
      "+webhookSecretEncrypted",
    );

    expect(stored?.webhookUrl).toBe(url);
    expect(stored?.webhookSecretEncrypted).toBeTruthy();
    expect(stored?.webhookSecretEncrypted).not.toBe(rotated.signingSecret);
    expect(decryptWebhookSecret(stored!.webhookSecretEncrypted!)).toBe(
      rotated.signingSecret,
    );
  });

  it("does not allow another workspace to rotate the signing secret", async () => {
    const { workspace, application } = await createTestApplication();

    const configured = await applicationService.updateWebhookConfiguration(
      workspace.id,
      application.id,
      "https://example.com/webhooks/digit-auth",
    );

    const originalSecret = configured.webhook.signingSecret!;

    const otherWorkspace = await workspaceRepository.create({
      ownerId: new Types.ObjectId().toString(),
      name: "Other Workspace",
    });

    await expect(
      applicationService.rotateWebhookSigningSecret(
        otherWorkspace.id,
        application.id,
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
    });

    const stored = await Application.findById(application.id).select(
      "+webhookSecretEncrypted",
    );

    expect(decryptWebhookSecret(stored!.webhookSecretEncrypted!)).toBe(
      originalSecret,
    );
  });

  it("returns 404 for a nonexistent application", async () => {
    const ownerId = new Types.ObjectId();
    const workspace = await workspaceRepository.create({
      ownerId: ownerId.toString(),
      name: "Webhook Test Workspace",
    });

    await expect(
      applicationService.updateWebhookConfiguration(
        workspace.id,
        new Types.ObjectId().toString(),
        "https://example.com/webhook",
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
