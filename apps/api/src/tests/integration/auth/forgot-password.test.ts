import request from "supertest";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { ApplicationService } from "../../../modules/application/service/application.service.js";

import { buildRegisterPayload } from "../../helpers/factories.js";

const applicationService = new ApplicationService();

async function createTestApplication() {
  const { application, credentials } =
    await applicationService.createApplication(
      "DigitAuth Forgot Password Test Application",
    );

  return {
    applicationId: new Types.ObjectId(application.id),
    clientId: credentials.clientId,
  };
}

describe("POST /api/v1/auth/forgot-password", () => {
  it("should generate a reset token", async () => {
    const { clientId } = await createTestApplication();
    const payload = buildRegisterPayload();

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .set("X-DigitAuth-Client-Id", clientId)
      .send(payload);

    expect(registerResponse.status).toBe(201);

    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        email: payload.email,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.resetToken).toBeDefined();
  });

  it("should return success even for unknown email", async () => {
    const { clientId } = await createTestApplication();

    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        email: "unknown@example.com",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
  });
});
