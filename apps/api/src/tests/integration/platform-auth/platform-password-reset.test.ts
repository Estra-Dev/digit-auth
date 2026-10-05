import request from "supertest";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { platformAccountRepository } from "../../../modules/platform-account/repository/platform-account.repository.js";
import { platformSessionRepository } from "../../../modules/platform-session/repository/platform-session.repository.js";
import { platformPasswordResetRepository } from "../../../modules/platform-password-reset/index.js";
import { passwordService } from "../../../security/password/password.service.js";

const TEST_PASSWORD = "OldPassword123!";
const NEW_PASSWORD = "NewPassword456!";

async function createVerifiedPlatformAccount() {
  const email = `platform-reset-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}@example.com`;

  const passwordHashed = await passwordService.hash(TEST_PASSWORD);

  const account = await platformAccountRepository.create({
    email,
    passwordHashed,
    emailVerified: true,
  });

  return {
    account,
    email,
  };
}

describe("Platform password reset", () => {
  it("should return success for an unknown email", async () => {
    const response = await request(app)
      .post("/api/v1/platform/auth/forgot-password")
      .send({
        email: "unknown-platform-reset@example.com",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeNull();
  });

  it("should generate a reset token for a verified platform account", async () => {
    const { email } = await createVerifiedPlatformAccount();

    const response = await request(app)
      .post("/api/v1/platform/auth/forgot-password")
      .send({
        email,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.resetToken).toBeDefined();
    expect(typeof response.body.data.resetToken).toBe("string");
  });

  it("should reject an invalid reset token", async () => {
    const response = await request(app)
      .post("/api/v1/platform/auth/reset-password")
      .send({
        token: "invalid-reset-token",
        password: NEW_PASSWORD,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reset the password and invalidate existing sessions", async () => {
    const { account, email } = await createVerifiedPlatformAccount();

    const sessionId = new Types.ObjectId().toString();

    await platformSessionRepository.create({
      sessionId,
      platformAccountId: account._id,
      refreshTokenHash: "test-refresh-token-hash",
      userAgent: "platform-password-reset-test",
      ipAddress: "127.0.0.1",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const forgotResponse = await request(app)
      .post("/api/v1/platform/auth/forgot-password")
      .send({
        email,
      });

    expect(forgotResponse.status).toBe(200);

    const resetToken = forgotResponse.body.data.resetToken;

    expect(resetToken).toBeDefined();

    const resetResponse = await request(app)
      .post("/api/v1/platform/auth/reset-password")
      .send({
        token: resetToken,
        password: NEW_PASSWORD,
      });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.success).toBe(true);

    const remainingSessions = await platformSessionRepository.findByAccountId(
      account._id,
    );

    expect(remainingSessions).toHaveLength(0);

    const oldPasswordResponse = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email,
        password: TEST_PASSWORD,
      });

    expect(oldPasswordResponse.status).toBe(401);

    const newPasswordResponse = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email,
        password: NEW_PASSWORD,
      });

    expect(newPasswordResponse.status).toBe(200);
  });

  it("should reject a reset token after it has already been used", async () => {
    const { email } = await createVerifiedPlatformAccount();

    const forgotResponse = await request(app)
      .post("/api/v1/platform/auth/forgot-password")
      .send({
        email,
      });

    expect(forgotResponse.status).toBe(200);

    const resetToken = forgotResponse.body.data.resetToken;

    expect(resetToken).toBeDefined();

    const firstResetResponse = await request(app)
      .post("/api/v1/platform/auth/reset-password")
      .send({
        token: resetToken,
        password: NEW_PASSWORD,
      });

    expect(firstResetResponse.status).toBe(200);

    const secondResetResponse = await request(app)
      .post("/api/v1/platform/auth/reset-password")
      .send({
        token: resetToken,
        password: TEST_PASSWORD,
      });

    expect(secondResetResponse.status).toBe(400);
  });
});
