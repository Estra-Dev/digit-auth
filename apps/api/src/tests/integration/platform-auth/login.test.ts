import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { platformAccountRepository } from "../../../modules/platform-account/index.js";

import { PlatformSession } from "../../../modules/platform-session/index.js";

describe("POST /api/v1/platform/auth/login", () => {
  it("should reject an unverified platform account", async () => {
    const email = `platform-login-unverified-${Date.now()}@example.com`;

    const password = "TestPassword123!";

    const registerResponse = await request(app)
      .post("/api/v1/platform/auth/register")
      .send({
        email,
        password,
      });

    expect(registerResponse.status).toBe(201);

    const response = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email,
        password,
      });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toContain("verify");

    const account = await platformAccountRepository.findByEmail(email);

    expect(account).not.toBeNull();

    const sessions = await PlatformSession.find({
      platformAccountId: account!._id,
    });

    expect(sessions).toHaveLength(0);
  });

  it("should login successfully for a verified platform account", async () => {
    const email = `platform-login-verified-${Date.now()}@example.com`;

    const password = "TestPassword123!";

    const registerResponse = await request(app)
      .post("/api/v1/platform/auth/register")
      .send({
        email,
        password,
      });

    expect(registerResponse.status).toBe(201);

    const account = await platformAccountRepository.findByEmail(email);

    expect(account).not.toBeNull();

    const verifiedAccount = await platformAccountRepository.markEmailVerified(
      account!.id,
    );

    expect(verifiedAccount).not.toBeNull();
    expect(verifiedAccount!.emailVerified).toBe(true);

    const response = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email,
        password,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.account.email).toBe(email);

    expect(response.body.data.account.emailVerified).toBe(true);

    expect(response.body.data.accessToken).toBeDefined();

    expect(response.body.data.refreshToken).toBeDefined();

    const sessions = await PlatformSession.find({
      platformAccountId: account!._id,
    });

    expect(sessions).toHaveLength(1);
  });

  it("should reject an invalid password", async () => {
    const email = `platform-login-password-${Date.now()}@example.com`;

    const password = "TestPassword123!";

    const registerResponse = await request(app)
      .post("/api/v1/platform/auth/register")
      .send({
        email,
        password,
      });

    expect(registerResponse.status).toBe(201);

    const response = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email,
        password: "WrongPassword123!",
      });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toContain("Invalid");
  });

  it("should reject an unknown email", async () => {
    const response = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email: "unknown-platform@example.com",
        password: "TestPassword123!",
      });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });
});
