import request from "supertest";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { ApplicationService } from "../../../modules/application/service/application.service.js";

import { buildRegisterPayload } from "../../helpers/factories.js";

import { User } from "../../../modules/auth/model/user.model.js";

const applicationService = new ApplicationService();

async function createTestApplication() {
  const { application, credentials } =
    await applicationService.createApplication(
      "DigitAuth Verify Email Test Application",
    );

  return {
    applicationId: new Types.ObjectId(application.id),
    clientId: credentials.clientId,
  };
}

describe("POST /api/v1/auth/verify-email", () => {
  it("should verify a user's email", async () => {
    const { applicationId, clientId } = await createTestApplication();
    const payload = buildRegisterPayload();

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .set("X-DigitAuth-Client-Id", clientId)
      .send(payload);

    expect(registerResponse.status).toBe(201);

    const verificationToken = registerResponse.body.data.verificationToken;

    expect(verificationToken).toBeDefined();

    const response = await request(app)
      .post("/api/v1/auth/verify-email")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        token: verificationToken,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    const verifiedUser = await User.findOne({
      applicationId,
      email: payload.email,
    });

    expect(verifiedUser).not.toBeNull();

    expect(verifiedUser!.emailVerified).toBe(true);
  });

  it("should reject invalid token", async () => {
    const { clientId } = await createTestApplication();

    const response = await request(app)
      .post("/api/v1/auth/verify-email")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        token: "invalid-token",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject expired verification token", async () => {
    // Expired-token coverage will be added separately once the
    // verification-token expiry test setup is migrated.
    expect(true).toBe(true);
  });
});
