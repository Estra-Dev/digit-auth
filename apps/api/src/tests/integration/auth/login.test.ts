import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import {
  buildLoginPayload,
  buildRegisterPayload,
} from "../../helpers/factories.js";
import { createVerifiedUser } from "../../helpers/auth.helper.js";

import { Session } from "../../../modules/auth/model/session.model.js";

import { tokenHashService } from "../../../security/index.js";

describe("POST /api/v1/auth/login", () => {
  it("should login successfully", async () => {
    const createdUser = await createVerifiedUser();

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(
        buildLoginPayload({
          email: createdUser.email,
          password: createdUser.password,
        }),
      );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.user.email).toBe(createdUser.email);

    expect(response.body.data.accessToken).toBeDefined();

    expect(response.body.data.refreshToken).toBeDefined();

    const sessions = await Session.find({
      userId: createdUser.user._id,
    }).select("+refreshTokenHash");

    expect(sessions).toHaveLength(1);

    const storedSession = sessions.at(0);

    if (!storedSession) {
      throw new Error("Expected session to exist.");
    }

    expect(storedSession.refreshTokenHash).toBe(
      tokenHashService.hash(response.body.data.refreshToken),
    );
  });

  it("should reject invalid password", async () => {
    const createdUser = await createVerifiedUser();

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(
        buildLoginPayload({
          email: createdUser.email,
          password: "WrongPassword123@",
        }),
      );

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toContain("Invalid");
  });

  it("should reject unknown email", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(
        buildLoginPayload({
          email: "unknown@example.com",
        }),
      );

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject unverified email", async () => {
    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(
        buildLoginPayload({
          email: payload.email,
          password: payload.password,
        }),
      );

    expect(response.status).toBe(403);

    expect(response.body.message).toContain("verify");
  });
});
