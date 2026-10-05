import request from "supertest";
import { describe, expect, it, beforeEach } from "vitest";

import app from "../../helpers/app.js";

import { EmailVerificationToken } from "../../../modules/email-verification/index.js";

import { testEmailProvider } from "../../../modules/email/index.js";

import { platformAccountRepository } from "../../../modules/platform-account/index.js";

describe("POST /api/v1/platform/auth/resend-verification-email", () => {
  beforeEach(() => {
    testEmailProvider.sentEmails.length = 0;
  });

  it("should resend verification email for an unverified account", async () => {
    const email = `platform-resend-${Date.now()}@example.com`;

    const registerResponse = await request(app)
      .post("/api/v1/platform/auth/register")
      .send({
        email,
        password: "TestPassword123!",
      });

    expect(registerResponse.status).toBe(201);
    expect(testEmailProvider.sentEmails).toHaveLength(1);

    const firstEmail = testEmailProvider.sentEmails.at(0);

    expect(firstEmail).toBeDefined();

    if (!firstEmail) {
      throw new Error("Initial verification email was not sent.");
    }

    const account = await platformAccountRepository.findByEmail(email);

    expect(account).not.toBeNull();

    const oldToken = await EmailVerificationToken.findOne({
      accountId: account!._id,
    }).select("+tokenHash");

    expect(oldToken).not.toBeNull();

    const resendResponse = await request(app)
      .post("/api/v1/platform/auth/resend-verification-email")
      .send({
        email,
      });

    expect(resendResponse.status).toBe(200);
    expect(resendResponse.body.success).toBe(true);

    expect(testEmailProvider.sentEmails).toHaveLength(2);

    const secondEmail = testEmailProvider.sentEmails.at(1);

    expect(secondEmail).toBeDefined();

    if (!secondEmail) {
      throw new Error("Resend verification email was not sent.");
    }

    expect(secondEmail.to).toBe(email);
    expect(secondEmail.subject).toBe("Verify your DigitAuth email");

    const activeTokens = await EmailVerificationToken.find({
      accountId: account!._id,
      usedAt: null,
    }).select("+tokenHash");

    expect(activeTokens).toHaveLength(1);

    expect(activeTokens[0]!.tokenHash).not.toBe(oldToken!.tokenHash);
  });

  it("should return success for an unknown email", async () => {
    const response = await request(app)
      .post("/api/v1/platform/auth/resend-verification-email")
      .send({
        email: "unknown@example.com",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(testEmailProvider.sentEmails).toHaveLength(0);
  });

  it("should return success without sending email for a verified account", async () => {
    const email = `platform-verified-${Date.now()}@example.com`;

    const registerResponse = await request(app)
      .post("/api/v1/platform/auth/register")
      .send({
        email,
        password: "TestPassword123!",
      });

    expect(registerResponse.status).toBe(201);

    const account = await platformAccountRepository.findByEmail(email);

    expect(account).not.toBeNull();

    await platformAccountRepository.markEmailVerified(account!.id);

    await EmailVerificationToken.deleteMany({
      accountId: account!._id,
    });

    testEmailProvider.sentEmails.length = 0;

    const response = await request(app)
      .post("/api/v1/platform/auth/resend-verification-email")
      .send({
        email,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(testEmailProvider.sentEmails).toHaveLength(0);

    expect(
      await EmailVerificationToken.countDocuments({
        accountId: account!._id,
      }),
    ).toBe(0);
  });

  it("should reject an invalid email", async () => {
    const response = await request(app)
      .post("/api/v1/platform/auth/resend-verification-email")
      .send({
        email: "not-an-email",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    expect(testEmailProvider.sentEmails).toHaveLength(0);
  });
});
