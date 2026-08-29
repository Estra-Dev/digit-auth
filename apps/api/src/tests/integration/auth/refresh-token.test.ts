import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { loginAsVerifiedUser } from "../../helpers/login.helper.js";

import { Session } from "../../../modules/auth/model/session.model.js";

import { tokenHashService } from "../../../security/index.js";

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

    expect(response.body.data.refreshToken).not.toBe(auth.refreshToken);
  });

  it("should rotate the refresh token and replace the stored session", async () => {
    const auth = await loginAsVerifiedUser();

    const firstRefresh = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: auth.refreshToken,
    });

    expect(firstRefresh.status).toBe(200);

    const newRefreshToken = firstRefresh.body.data.refreshToken;

    expect(newRefreshToken).toBeDefined();

    expect(newRefreshToken).not.toBe(auth.refreshToken);

    const sessions = await Session.find({
      userId: auth.user._id,
    }).select("+refreshTokenHash");

    expect(sessions).toHaveLength(1);

    const storedSession = sessions.at(0);

    if (!storedSession) {
      throw new Error("Expected one active session.");
    }

    expect(storedSession.refreshTokenHash).toBe(
      tokenHashService.hash(newRefreshToken),
    );
  });

  it("should reject reuse of the old refresh token", async () => {
    const auth = await loginAsVerifiedUser();

    const firstRefresh = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: auth.refreshToken,
    });

    expect(firstRefresh.status).toBe(200);

    const reusedResponse = await request(app)
      .post("/api/v1/auth/refresh")
      .send({
        refreshToken: auth.refreshToken,
      });

    expect(reusedResponse.status).toBe(401);

    expect(reusedResponse.body.success).toBe(false);
  });

  it("should allow the newly issued refresh token to be used", async () => {
    const auth = await loginAsVerifiedUser();

    const firstRefresh = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: auth.refreshToken,
    });

    expect(firstRefresh.status).toBe(200);

    const newRefreshToken = firstRefresh.body.data.refreshToken;

    const secondRefresh = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: newRefreshToken,
    });

    expect(secondRefresh.status).toBe(200);

    expect(secondRefresh.body.success).toBe(true);

    expect(secondRefresh.body.data.accessToken).toBeDefined();

    expect(secondRefresh.body.data.refreshToken).toBeDefined();
  });

  it("should reject an invalid refresh token", async () => {
    const response = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: "invalid-token",
    });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should keep only one session after multiple rotations", async () => {
    const auth = await loginAsVerifiedUser();

    const firstRefresh = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: auth.refreshToken,
    });

    expect(firstRefresh.status).toBe(200);

    const secondRefresh = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: firstRefresh.body.data.refreshToken,
    });

    expect(secondRefresh.status).toBe(200);

    const sessions = await Session.find({
      userId: auth.user._id,
    });

    expect(sessions).toHaveLength(1);
  });
});
