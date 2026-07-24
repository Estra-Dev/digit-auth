import request from "supertest";

import app from "../../helpers/app.js";

import { User } from "../../../modules/auth/model/user.model.js";
import { VerificationToken } from "../../../modules/auth/model/verification-token.model.js";

import { buildRegisterPayload } from "../../helpers/factories.js";
import { describe, expect, it } from "vitest";

describe("POST /api/v1/auth/register", () => {
  it("should register a new user successfully", async () => {
    const payload = buildRegisterPayload();

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.data.email).toBe(payload.email);

    expect(response.body.data.firstName).toBe(payload.firstName);

    expect(response.body.data.lastName).toBe(payload.lastName);

    expect(response.body.data.emailVerified).toBe(false);

    const user = await User.findOne({
      email: payload.email,
    }).select("+passwordHashed");

    expect(user).not.toBeNull();

    expect(user?.passwordHashed).not.toBe(payload.password);

    expect(user?.emailVerified).toBe(false);

    const verificationToken = await VerificationToken.findOne({
      userId: user!._id,
    });

    expect(verificationToken).not.toBeNull();
  });

  it("should reject duplicate email registration", async () => {
    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toContain("already exist");
  });

  it("should reject when passwords do not match", async () => {
    const payload = buildRegisterPayload({
      confirmPassword: "DifferentPassword123@",
    });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject invalid email", async () => {
    const payload = buildRegisterPayload({
      email: "not-an-email",
    });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject missing first name", async () => {
    const payload = buildRegisterPayload({
      firstName: "",
    });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject short password", async () => {
    const payload = buildRegisterPayload({
      password: "123",
      confirmPassword: "123",
    });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });
});
