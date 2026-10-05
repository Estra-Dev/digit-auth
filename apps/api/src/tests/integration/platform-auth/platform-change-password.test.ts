import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";
import { passwordService } from "../../../security/password/password.service.js";
import { platformAccountRepository } from "../../../modules/platform-account/repository/platform-account.repository.js";

const OLD_PASSWORD = "OldPassword123@";
const NEW_PASSWORD = "NewPassword456@";

async function createVerifiedPlatformAccount() {
  const email = `platform-change-password-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}@example.com`;

  const passwordHashed = await passwordService.hash(OLD_PASSWORD);

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

describe("PATCH /api/v1/platform/auth/password", () => {
  it("should change the password and invalidate all existing sessions", async () => {
    const { email } = await createVerifiedPlatformAccount();

    const loginResponse = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email,
        password: OLD_PASSWORD,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const refreshToken = loginResponse.body.data.refreshToken;

    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    const changePasswordResponse = await request(app)
      .patch("/api/v1/platform/auth/password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        currentPassword: OLD_PASSWORD,
        newPassword: NEW_PASSWORD,
      });

    expect(changePasswordResponse.status).toBe(200);

    expect(changePasswordResponse.body.message).toBe(
      "Password changed successfully. Please log in again.",
    );

    const oldSessionResponse = await request(app)
      .get("/api/v1/platform/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(oldSessionResponse.status).toBe(401);

    const oldPasswordLoginResponse = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email,
        password: OLD_PASSWORD,
      });

    expect(oldPasswordLoginResponse.status).toBe(401);

    const newPasswordLoginResponse = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email,
        password: NEW_PASSWORD,
      });

    expect(newPasswordLoginResponse.status).toBe(200);

    expect(newPasswordLoginResponse.body.data.accessToken).toBeTruthy();

    expect(newPasswordLoginResponse.body.data.refreshToken).toBeTruthy();
  });

  it("should reject an incorrect current password", async () => {
    const { email } = await createVerifiedPlatformAccount();

    const loginResponse = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email,
        password: OLD_PASSWORD,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .patch("/api/v1/platform/auth/password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        currentPassword: "WrongPassword123@",
        newPassword: NEW_PASSWORD,
      });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Current password is incorrect.");
  });

  it("should reject a new password shorter than 8 characters", async () => {
    const { email } = await createVerifiedPlatformAccount();

    const loginResponse = await request(app)
      .post("/api/v1/platform/auth/login")
      .send({
        email,
        password: OLD_PASSWORD,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .patch("/api/v1/platform/auth/password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        currentPassword: OLD_PASSWORD,
        newPassword: "short",
      });

    expect(response.status).toBe(400);
  });
});
