import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import {
  EmailVerificationToken,
  emailVerificationService,
} from "../../../modules/email-verification/index.js";

import { testEmailProvider } from "../../../modules/email/index.js";

import { platformAccountRepository } from "../../../modules/platform-account/index.js";

function extractVerificationToken(html: string): string {
  const match = html.match(/\/platform\/verify-email\?token=([^"&]+)/);

  expect(match).not.toBeNull();

  const token = match?.[1];

  expect(token).toBeDefined();

  if (!token) {
    throw new Error("Verification token was not found in email.");
  }

  return decodeURIComponent(token);
}

describe("POST /api/v1/platform/auth/verify-email", () => {
  beforeEach(() => {
    testEmailProvider.sentEmails.length = 0;
  });

  it("should verify a platform account email", async () => {
    const email = `platform-${Date.now()}@example.com`;

    const registerResponse = await request(app)
      .post("/api/v1/platform/auth/register")
      .send({
        email,
        password: "TestPassword123!",
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);

    expect(testEmailProvider.sentEmails).toHaveLength(1);

    const sentEmail = testEmailProvider.sentEmails.at(0);

    expect(sentEmail).toBeDefined();

    if (!sentEmail) {
      throw new Error("Verification email was not sent.");
    }

    expect(sentEmail.to).toBe(email);

    expect(sentEmail.subject).toBe("Verify your DigitAuth email");

    const verificationToken = extractVerificationToken(sentEmail.html);

    const response = await request(app)
      .post("/api/v1/platform/auth/verify-email")
      .send({
        token: verificationToken,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.account.emailVerified).toBe(true);

    const account = await platformAccountRepository.findByEmail(email);

    expect(account).not.toBeNull();
    expect(account!.emailVerified).toBe(true);
  });

  it("should reject an invalid verification token", async () => {
    const response = await request(app)
      .post("/api/v1/platform/auth/verify-email")
      .send({
        token: "invalid-verification-token",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject a verification token that has already been used", async () => {
    const email = `platform-reuse-${Date.now()}@example.com`;

    const registerResponse = await request(app)
      .post("/api/v1/platform/auth/register")
      .send({
        email,
        password: "TestPassword123!",
      });

    expect(registerResponse.status).toBe(201);

    const sentEmail = testEmailProvider.sentEmails.at(0);

    expect(sentEmail).toBeDefined();

    if (!sentEmail) {
      throw new Error("Verification email was not sent.");
    }

    const verificationToken = extractVerificationToken(sentEmail.html);

    const firstResponse = await request(app)
      .post("/api/v1/platform/auth/verify-email")
      .send({
        token: verificationToken,
      });

    expect(firstResponse.status).toBe(200);

    const secondResponse = await request(app)
      .post("/api/v1/platform/auth/verify-email")
      .send({
        token: verificationToken,
      });

    expect(secondResponse.status).toBe(400);
    expect(secondResponse.body.success).toBe(false);
  });

  it("should reject an expired verification token", async () => {
    const email = `platform-expired-${Date.now()}@example.com`;

    const account = await platformAccountRepository.create({
      email,
      passwordHashed: "test-password-hash",
      emailVerified: false,
    });

    const verification = await emailVerificationService.createVerificationToken(
      account.id,
    );

    await EmailVerificationToken.updateOne(
      {
        accountId: account.id,
      },
      {
        $set: {
          expiresAt: new Date(Date.now() - 1000),
        },
      },
    );

    const response = await request(app)
      .post("/api/v1/platform/auth/verify-email")
      .send({
        token: verification.token,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    const updatedAccount = await platformAccountRepository.findByEmail(email);

    expect(updatedAccount).not.toBeNull();
    expect(updatedAccount!.emailVerified).toBe(false);
  });

  it("should reject an empty verification token", async () => {
    const response = await request(app)
      .post("/api/v1/platform/auth/verify-email")
      .send({
        token: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
