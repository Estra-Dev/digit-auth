import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { Session } from "../../../modules/auth/model/session.model.js";

import { loginAsVerifiedUser } from "../../helpers/login.helper.js";

describe("POST /api/v1/auth/logout", () => {
  it("should logout successfully", async () => {
    const auth = await loginAsVerifiedUser();

    console.log("AUTH OBJECT:");
    console.dir(auth, { depth: null });

    console.log("REFRESH TOKEN:");
    console.log(auth.refreshToken);

    const payload = {
      refreshToken: auth.refreshToken,
    };

    console.log("PAYLOAD:");
    console.dir(payload, { depth: null });

    const response = await request(app)
      .post("/api/v1/auth/logout")
      .send(payload)
      .send({
        refreshToken: auth.refreshToken,
      });

    console.log(JSON.stringify(response.body, null, 2));

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    const sessions = await Session.find({
      userId: auth.user._id,
    });

    expect(sessions).toHaveLength(0);
  });

  it("should reject invalid refresh token", async () => {
    const response = await request(app).post("/api/v1/auth/logout").send({
      refreshToken: "invalid-token",
    });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });
});
