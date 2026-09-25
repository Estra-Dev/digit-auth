import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { Session } from "../../../modules/auth/model/session.model.js";

import { loginAsVerifiedUser } from "../../helpers/login.helper.js";

describe("POST /api/v1/auth/logout", () => {
  it("should logout successfully", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .send({
        refreshToken: auth.refreshToken,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    const sessions = await Session.find({
      applicationId: auth.applicationId,
      userId: auth.user._id,
    });

    expect(sessions).toHaveLength(0);
  });

  it("should reject an invalid refresh token", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .send({
        refreshToken: "invalid-token",
      });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject a refresh token from another application", async () => {
    const applicationA = await loginAsVerifiedUser();
    const applicationB = await loginAsVerifiedUser();

    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("X-DigitAuth-Client-Id", applicationB.clientId)
      .send({
        refreshToken: applicationA.refreshToken,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);

    const applicationASessions = await Session.find({
      applicationId: applicationA.applicationId,
      userId: applicationA.user._id,
    });

    expect(applicationASessions).toHaveLength(1);
  });

  it("should logout from all devices successfully", async () => {
    const auth = await loginAsVerifiedUser();

    const secondLogin = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .send({
        email: auth.email,
        password: auth.password,
      });

    expect(secondLogin.status).toBe(200);

    const sessionsBeforeLogout = await Session.find({
      applicationId: auth.applicationId,
      userId: auth.user._id,
    });

    expect(sessionsBeforeLogout).toHaveLength(2);

    const response = await request(app)
      .post("/api/v1/auth/logout-all")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .send({
        refreshToken: auth.refreshToken,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const sessionsAfterLogout = await Session.find({
      applicationId: auth.applicationId,
      userId: auth.user._id,
    });

    expect(sessionsAfterLogout).toHaveLength(0);
  });

  it("should reject a refresh token from another application for logout-all", async () => {
    const applicationA = await loginAsVerifiedUser();
    const applicationB = await loginAsVerifiedUser();

    const response = await request(app)
      .post("/api/v1/auth/logout-all")
      .set("X-DigitAuth-Client-Id", applicationB.clientId)
      .send({
        refreshToken: applicationA.refreshToken,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);

    const applicationASessions = await Session.find({
      applicationId: applicationA.applicationId,
      userId: applicationA.user._id,
    });

    expect(applicationASessions).toHaveLength(1);
  });
});
