import request from "supertest";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { ApplicationService } from "../../../modules/application/service/application.service.js";

import {
  buildLoginPayload,
  buildRegisterPayload,
} from "../../helpers/factories.js";

import { User } from "../../../modules/auth/model/user.model.js";
import { Session } from "../../../modules/auth/model/session.model.js";

const applicationService = new ApplicationService();

async function createTestApplication() {
  const { application, credentials } =
    await applicationService.createApplication(
      "DigitAuth Reset Password Test Application",
    );

  return {
    applicationId: new Types.ObjectId(application.id),
    clientId: credentials.clientId,
  };
}

describe("POST /api/v1/auth/reset-password", () => {
  it("should reset password successfully", async () => {
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

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", clientId)
      .send(
        buildLoginPayload({
          email: payload.email,
          password: payload.password,
        }),
      );

    expect(loginResponse.status).toBe(200);

    const user = await User.findOne({
      applicationId,
      email: payload.email,
    });

    expect(user).not.toBeNull();

    expect(
      await Session.countDocuments({
        applicationId,
        userId: user!._id,
      }),
    ).toBe(1);

    const forgotPasswordResponse = await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        email: payload.email,
      });

    expect(forgotPasswordResponse.status).toBe(200);

    const token = forgotPasswordResponse.body.data.resetToken;

    expect(token).toBeDefined();

    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        token,
        password: "NewPassword123@",
        confirmPassword: "NewPassword123@",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    const oldLogin = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", clientId)
      .send(
        buildLoginPayload({
          email: payload.email,
          password: payload.password,
        }),
      );

    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", clientId)
      .send(
        buildLoginPayload({
          email: payload.email,
          password: "NewPassword123@",
        }),
      );

    expect(newLogin.status).toBe(200);

    expect(
      await Session.countDocuments({
        applicationId,
        userId: user!._id,
      }),
    ).toBe(1);
  });

  it("should reject invalid token", async () => {
    const { clientId } = await createTestApplication();

    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        token: "invalid-token",
        password: "Password123@",
        confirmPassword: "Password123@",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject mismatched passwords", async () => {
    const { clientId } = await createTestApplication();

    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        token: "anything",
        password: "Password123@",
        confirmPassword: "AnotherPassword123@",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject reused reset token", async () => {
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

    const forgotPasswordResponse = await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        email: payload.email,
      });

    expect(forgotPasswordResponse.status).toBe(200);

    const token = forgotPasswordResponse.body.data.resetToken;

    expect(token).toBeDefined();

    const firstAttempt = await request(app)
      .post("/api/v1/auth/reset-password")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        token,
        password: "NewPassword123@",
        confirmPassword: "NewPassword123@",
      });

    expect(firstAttempt.status).toBe(200);

    const secondAttempt = await request(app)
      .post("/api/v1/auth/reset-password")
      .set("X-DigitAuth-Client-Id", clientId)
      .send({
        token,
        password: "AnotherPassword123@",
        confirmPassword: "AnotherPassword123@",
      });

    expect(secondAttempt.status).toBe(400);

    expect(secondAttempt.body.success).toBe(false);
  });
});
