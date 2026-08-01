import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { Session } from "../../../modules/auth/model/session.model.js";

import { loginAsVerifiedUser } from "../../helpers/login.helper.js";

import { tokenHashService } from "../../../security/index.js";

describe("POST /api/v1/auth/refresh", () => {
  it("should rotate refresh token successfully", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: auth.refreshToken,
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.accessToken).toBeDefined();

    expect(response.body.data.refreshToken).toBeDefined();

    expect(response.body.data.refreshToken).not.toBe(auth.refreshToken);

    const sessions = await Session.find({
      userId: auth.user._id,
    }).select("+refreshTokenHash");

    expect(sessions).toHaveLength(1);

    const storedSession = sessions.at(0);

    if (!storedSession) {
      throw new Error("Expected one active session.");
    }

    expect(storedSession.refreshTokenHash).toBe(
      tokenHashService.hash(response.body.data.refreshToken),
    );

    const reusedResponse = await request(app)
      .post("/api/v1/auth/refresh")
      .send({
        refreshToken: auth.refreshToken,
      });

    expect(reusedResponse.status).toBe(401);

    expect(reusedResponse.body.success).toBe(false);
  });
});
