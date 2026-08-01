import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import {
  buildLoginPayload,
  buildRegisterPayload,
} from "../../helpers/factories.js";

import { User, UserStatus } from "../../../modules/auth/model/user.model.js";

describe("GET /api/v1/auth/me", () => {
  it("should return the current authenticated user", async () => {
    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    await User.updateOne({ email: payload.email }, { emailVerified: true });

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send(
        buildLoginPayload({
          email: payload.email,
          password: payload.password,
        }),
      );

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.email).toBe(payload.email);

    expect(response.body.data.firstName).toBe(payload.firstName);

    expect(response.body.data.lastName).toBe(payload.lastName);
  });

  it("should reject requests without an access token", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject invalid access tokens", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject deleted users", async () => {
    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    await User.updateOne({ email: payload.email }, { emailVerified: true });

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send(
        buildLoginPayload({
          email: payload.email,
          password: payload.password,
        }),
      );

    const accessToken = login.body.data.accessToken;

    const user = await User.findOne({
      email: payload.email,
    });

    await User.deleteOne({
      _id: user!._id,
    });

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);
  });

  it("should reject inactive users", async () => {
    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    await User.updateOne(
      { email: payload.email },
      {
        emailVerified: true,
        status: UserStatus.DEACTIVATED,
      },
    );

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send(
        buildLoginPayload({
          email: payload.email,
          password: payload.password,
        }),
      );

    const accessToken = login.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);
  });
});
