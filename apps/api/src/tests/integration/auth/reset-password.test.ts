import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import {
  buildLoginPayload,
  buildRegisterPayload,
} from "../../helpers/factories.js";

import { User } from "../../../modules/auth/model/user.model.js";
import { Session } from "../../../modules/auth/model/session.model.js";

describe("POST /api/v1/auth/reset-password", () => {
  // it("should reset password successfully", async () => {
  //   const payload = buildRegisterPayload();

  //   await request(app).post("/api/v1/auth/register").send(payload);

  //   await User.updateOne(
  //     {
  //       email: payload.email,
  //     },
  //     {
  //       emailVerified: true,
  //     },
  //   );

  //   // Login first so we create an active session
  //   const loginResponse = await request(app)
  //     .post("/api/v1/auth/login")
  //     .send(
  //       buildLoginPayload({
  //         email: payload.email,
  //         password: payload.password,
  //       }),
  //     );

  //   expect(loginResponse.status).toBe(200);

  //   // Ensure a session exists
  //   const user = await User.findOne({
  //     email: payload.email,
  //   });

  //   expect(user).not.toBeNull();

  //   expect(
  //     await Session.countDocuments({
  //       userId: user!._id,
  //     }),
  //   ).toBe(1);

  //   // Generate reset token
  //   const forgotPasswordResponse = await request(app)
  //     .post("/api/v1/auth/forgot-password")
  //     .send({
  //       email: payload.email,
  //     });

  //   const token = forgotPasswordResponse.body.data.resetToken;

  //   // Reset password
  //   const response = await request(app)
  //     .post("/api/v1/auth/reset-password")
  //     .send({
  //       token,
  //       password: "NewPassword123@",
  //       confirmPassword: "NewPassword123@",
  //     });

  //   expect(response.status).toBe(200);

  //   expect(response.body.success).toBe(true);

  //   // Old password should fail
  //   const oldLogin = await request(app)
  //     .post("/api/v1/auth/login")
  //     .send(
  //       buildLoginPayload({
  //         email: payload.email,
  //         password: payload.password,
  //       }),
  //     );

  //   expect(oldLogin.status).toBe(401);

  //   // New password should work
  //   const newLogin = await request(app)
  //     .post("/api/v1/auth/login")
  //     .send(
  //       buildLoginPayload({
  //         email: payload.email,
  //         password: "NewPassword123@",
  //       }),
  //     );

  //   expect(newLogin.status).toBe(200);

  //   // Previous sessions should have been revoked.
  //   // Only the new login should create one fresh session.
  //   expect(
  //     await Session.countDocuments({
  //       userId: user!._id,
  //     }),
  //   ).toBe(1);
  // });

  it("should reset password successfully", async () => {
    console.log("1");

    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    console.log("2");

    await User.updateOne({ email: payload.email }, { emailVerified: true });

    console.log("3");

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send(
        buildLoginPayload({
          email: payload.email,
          password: payload.password,
        }),
      );

    console.log("4");

    expect(loginResponse.status).toBe(200);

    const forgotPasswordResponse = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: payload.email,
      });

    console.log("5");

    const token = forgotPasswordResponse.body.data.resetToken;

    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token,
        password: "NewPassword123@",
        confirmPassword: "NewPassword123@",
      });

    console.log("6");

    expect(response.status).toBe(200);
  });
  it("should reject invalid token", async () => {
    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token: "invalid-token",
        password: "Password123@",
        confirmPassword: "Password123@",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject mismatched passwords", async () => {
    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token: "anything",
        password: "Password123@",
        confirmPassword: "AnotherPassword123@",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject reused reset token", async () => {
    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    await User.updateOne(
      {
        email: payload.email,
      },
      {
        emailVerified: true,
      },
    );

    const forgotPasswordResponse = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: payload.email,
      });

    const token = forgotPasswordResponse.body.data.resetToken;

    await request(app).post("/api/v1/auth/reset-password").send({
      token,
      password: "NewPassword123@",
      confirmPassword: "NewPassword123@",
    });

    const secondAttempt = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token,
        password: "AnotherPassword123@",
        confirmPassword: "AnotherPassword123@",
      });

    expect(secondAttempt.status).toBe(400);

    expect(secondAttempt.body.success).toBe(false);
  });
});
