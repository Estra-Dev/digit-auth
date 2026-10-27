import request from "supertest";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { ApplicationService } from "../../../modules/application/service/application.service.js";

import { User } from "../../../modules/auth/model/user.model.js";
import { VerificationToken } from "../../../modules/auth/model/verification-token.model.js";

import { buildRegisterPayload } from "../../helpers/factories.js";
import { getTestWorkspace } from "../../helpers/workspace.helper.js";
import { withApplicationCredentials } from "../../helpers/application-auth.helper.js";
import WebhookEvent from "../../../modules/webhook/model/webhook-event.model.js";

const applicationService = new ApplicationService();

async function createTestApplication(webhookUrl?: string) {
  const workspace = await getTestWorkspace();

  const { application, credentials } =
    await applicationService.createApplication(
      workspace.id,
      "DigitAuth Test Application",
    );

  if (webhookUrl) {
    await applicationService.updateWebhookConfiguration(
      workspace.id,
      application.id,
      webhookUrl,
    );
  }

  return {
    applicationId: new Types.ObjectId(application.id),
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
  };
}

describe("POST /api/v1/auth/register", () => {
  it("should register a new user successfully", async () => {
    const { applicationId, clientId, clientSecret } =
      await createTestApplication("https://example.com/webhooks");
    const payload = buildRegisterPayload();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.data.email).toBe(payload.email);

    expect(response.body.data.firstName).toBe(payload.firstName);

    expect(response.body.data.lastName).toBe(payload.lastName);

    expect(response.body.data.emailVerified).toBe(false);

    const user = await User.findOne({
      applicationId,
      email: payload.email,
    }).select("+passwordHashed");

    expect(user).not.toBeNull();

    expect(user?.passwordHashed).not.toBe(payload.password);

    expect(user?.emailVerified).toBe(false);

    const webhookEvent = await WebhookEvent.findOne().where({
      applicationId,
      event: "user.created",
      resourceId: user!._id,
    });

    expect(webhookEvent).not.toBeNull();
    expect(webhookEvent?.status).toBe("pending");
    expect(webhookEvent?.payload.id).toBe(user!._id.toString());
    expect(webhookEvent?.payload.applicationId).toBe(applicationId.toString());
    expect(webhookEvent?.payload.email).toBe(payload.email);
    expect(webhookEvent?.payload).not.toHaveProperty("password");
    expect(webhookEvent?.payload).not.toHaveProperty("passwordHashed");

    const verificationToken = await VerificationToken.findOne({
      applicationId,
      userId: user!._id,
    });

    expect(verificationToken).not.toBeNull();
  });

  it("should register a user without creating a webhook event when no webhook is configured", async () => {
    const { applicationId, clientId, clientSecret } =
      await createTestApplication();

    const payload = buildRegisterPayload();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(response.status).toBe(201);

    const user = await User.findOne({
      applicationId,
      email: payload.email,
    });

    expect(user).not.toBeNull();

    const webhookEvent = await WebhookEvent.findOne({
      applicationId,
      event: "user.created",
      resourceId: user!._id,
    });

    expect(webhookEvent).toBeNull();
  });

  it("should reject duplicate email registration", async () => {
    const { clientId, clientSecret } = await createTestApplication();
    const payload = buildRegisterPayload();

    const firstResponse = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(firstResponse.status).toBe(201);

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toContain("already exist");
  });

  it("should reject when passwords do not match", async () => {
    const { clientId, clientSecret } = await createTestApplication();

    const payload = buildRegisterPayload({
      confirmPassword: "DifferentPassword123@",
    });

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject invalid email", async () => {
    const { clientId, clientSecret } = await createTestApplication();

    const payload = buildRegisterPayload({
      email: "not-an-email",
    });

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject missing first name", async () => {
    const { clientId, clientSecret } = await createTestApplication();

    const payload = buildRegisterPayload({
      firstName: "",
    });

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject short password", async () => {
    const { clientId, clientSecret } = await createTestApplication();

    const payload = buildRegisterPayload({
      password: "123",
      confirmPassword: "123",
    });

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });
});
