import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { loginAsVerifiedUser } from "../../helpers/login.helper.js";

import { Session } from "../../../modules/auth/model/session.model.js";

describe("POST /api/v1/auth/refresh", () => {
  it("should refresh tokens successfully", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: auth.refreshToken,
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.accessToken).toBeDefined();

    expect(response.body.data.refreshToken).toBeDefined();
  });

  it("should rotate refresh tokens", async () => {
    const auth = await loginAsVerifiedUser();

    const firstRefresh = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: auth.refreshToken,
    });

    expect(firstRefresh.status).toBe(200);

    const newRefreshToken = firstRefresh.body.data.refreshToken;

    expect(newRefreshToken).not.toBe(auth.refreshToken);

    const secondRefresh = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: auth.refreshToken,
    });

    expect(secondRefresh.status).toBe(401);

    expect(secondRefresh.body.success).toBe(false);

    const thirdRefresh = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: newRefreshToken,
    });

    expect(thirdRefresh.status).toBe(200);

    expect(thirdRefresh.body.success).toBe(true);
  });

  it("should reject invalid refresh token", async () => {
    const response = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: "invalid-token",
    });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should keep only one session after rotation", async () => {
    const auth = await loginAsVerifiedUser();

    await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: auth.refreshToken,
    });

    const sessions = await Session.find({
      userId: auth.user._id,
    });

    expect(sessions).toHaveLength(1);
  });
});
