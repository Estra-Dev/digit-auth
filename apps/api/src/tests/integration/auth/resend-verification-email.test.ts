import request from "supertest";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { ApplicationService } from "../../../modules/application/service/application.service.js";

import { buildRegisterPayload } from "../../helpers/factories.js";

import { User } from "../../../modules/auth/model/user.model.js";
import { VerificationToken } from "../../../modules/auth/model/verification-token.model.js";

const applicationService = new ApplicationService();

async function createTestApplication() {
  const { application, credentials } =
    await applicationService.createApplication(
      "DigitAuth Resend Verification Test Application",
    );

  return {
    applicationId: new Types.ObjectId(application.id),
    clientId: credentials.clientId,
  };
}

describe("POST /api/v1/auth/resend-verification-email", () => {
  it("should resend verification email", async () => {
    const { applicationId, clientId } = await createTestApplication();
    const payload = buildRegisterPayload();

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .set("X-DigitAuth-Client-Id", clientId)
      .send(payload);

    expect(registerResponse.status).toBe(201);

    const user = await User.findOne({
      applicationId,
      email: payload.email,
    });

    expect(user).not.toBeNull();

    const oldToken = await VerificationToken.findOne({
      applicationId,
      userId: user!._id,
    }).select("+tokenHash");

    expect(oldToken).not.toBeNull();

    const response = await request(app)
      .post("/api/v1/auth/resend-verification-email")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        email: payload.email,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    const newToken = await VerificationToken.findOne({
      applicationId,
      userId: user!._id,
    }).select("+tokenHash");

    expect(newToken).not.toBeNull();

    expect(newToken!.tokenHash).not.toBe(oldToken!.tokenHash);
  });

  it("should return success for unknown email", async () => {
    const { clientId } = await createTestApplication();

    const response = await request(app)
      .post("/api/v1/auth/resend-verification-email")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        email: "unknown@example.com",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
  });

  it("should not resend verification email for verified user", async () => {
    const { applicationId, clientId } = await createTestApplication();
    const payload = buildRegisterPayload();

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .set("X-DigitAuth-Client-Id", clientId)
      .send(payload);

    expect(registerResponse.status).toBe(201);

    await User.updateOne(
      {
        applicationId,
        email: payload.email,
      },
      {
        emailVerified: true,
      },
    );

    const user = await User.findOne({
      applicationId,
      email: payload.email,
    });

    expect(user).not.toBeNull();

    await VerificationToken.deleteMany({
      applicationId,
      userId: user!._id,
    });

    const response = await request(app)
      .post("/api/v1/auth/resend-verification-email")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        email: payload.email,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(
      await VerificationToken.countDocuments({
        applicationId,
        userId: user!._id,
      }),
    ).toBe(0);
  });
});
