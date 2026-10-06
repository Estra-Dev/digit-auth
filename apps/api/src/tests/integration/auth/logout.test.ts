import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { Session } from "../../../modules/auth/model/session.model.js";

import { loginAsVerifiedUser } from "../../helpers/login.helper.js";
import { withApplicationCredentials } from "../../helpers/application-auth.helper.js";

describe("POST /api/v1/auth/logout", () => {
  it("should logout successfully", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/logout"),
      auth.clientId,
      auth.clientSecret,
    ).send({
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

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/logout"),
      auth.clientId,
      auth.clientSecret,
    ).send({
      refreshToken: "invalid-token",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject a refresh token from another application", async () => {
    const applicationA = await loginAsVerifiedUser();
    const applicationB = await loginAsVerifiedUser();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/logout"),
      applicationB.clientId,
      applicationB.clientSecret,
    ).send({
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

    const secondLogin = await withApplicationCredentials(
      request(app).post("/api/v1/auth/login"),
      auth.clientId,
      auth.clientSecret,
    ).send({
      email: auth.email,
      password: auth.password,
    });

    expect(secondLogin.status).toBe(200);

    const sessionsBeforeLogout = await Session.find({
      applicationId: auth.applicationId,
      userId: auth.user._id,
    });

    expect(sessionsBeforeLogout).toHaveLength(2);

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/logout-all"),
      auth.clientId,
      auth.clientSecret,
    ).send({
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

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/logout-all"),
      applicationB.clientId,
      applicationB.clientSecret,
    ).send({
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
