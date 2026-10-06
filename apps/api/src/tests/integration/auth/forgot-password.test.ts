import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { ApplicationService } from "../../../modules/application/service/application.service.js";

import { buildRegisterPayload } from "../../helpers/factories.js";
import { getTestWorkspace } from "../../helpers/workspace.helper.js";
import { withApplicationCredentials } from "../../helpers/application-auth.helper.js";

const applicationService = new ApplicationService();

async function createTestApplication() {
  const workspace = await getTestWorkspace();

  const { application, credentials } =
    await applicationService.createApplication(
      workspace.id,
      "DigitAuth Test Application",
    );

  return {
    applicationId: application.id,
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
  };
}

describe("POST /api/v1/auth/forgot-password", () => {
  it("should generate a reset token", async () => {
    const { clientId, clientSecret } = await createTestApplication();
    const payload = buildRegisterPayload();

    const registerResponse = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(registerResponse.status).toBe(201);

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/forgot-password"),
      clientId,
      clientSecret,
    ).send({
      email: payload.email,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.resetToken).toBeDefined();
  });

  it("should return success even for unknown email", async () => {
    const { clientId, clientSecret } = await createTestApplication();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/forgot-password"),
      clientId,
      clientSecret,
    ).send({
      email: "unknown@example.com",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
