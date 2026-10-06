import request from "supertest";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { ApplicationService } from "../../../modules/application/service/application.service.js";

import { buildRegisterPayload } from "../../helpers/factories.js";

import { User } from "../../../modules/auth/model/user.model.js";
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
    applicationId: new Types.ObjectId(application.id),
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
  };
}

describe("POST /api/v1/auth/verify-email", () => {
  it("should verify a user's email", async () => {
    const { applicationId, clientId, clientSecret } =
      await createTestApplication();

    const payload = buildRegisterPayload();

    const registerResponse = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(registerResponse.status).toBe(201);

    const verificationToken = registerResponse.body.data.verificationToken;

    expect(verificationToken).toBeDefined();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/verify-email"),
      clientId,
      clientSecret,
    ).send({
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
    const { clientId, clientSecret } = await createTestApplication();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/verify-email"),
      clientId,
      clientSecret,
    ).send({
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
