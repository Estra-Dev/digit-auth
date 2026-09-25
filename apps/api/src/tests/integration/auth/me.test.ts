import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { createVerifiedUser } from "../../helpers/auth.helper.js";

import { User, UserStatus } from "../../../modules/auth/model/user.model.js";

describe("GET /api/v1/auth/me", () => {
  it("should return the current authenticated user", async () => {
    const auth = await createVerifiedUser();

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .send({
        email: auth.email,
        password: auth.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.email).toBe(auth.email);

    expect(response.body.data.firstName).toBe(auth.user.firstName);

    expect(response.body.data.lastName).toBe(auth.user.lastName);
  });

  it("should reject requests without an access token", async () => {
    const auth = await createVerifiedUser();

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("X-DigitAuth-Client-Id", auth.clientId);

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject invalid access tokens", async () => {
    const auth = await createVerifiedUser();

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject an access token from another application", async () => {
    const applicationA = await createVerifiedUser();
    const applicationB = await createVerifiedUser();

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", applicationA.clientId)
      .send({
        email: applicationA.email,
        password: applicationA.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("X-DigitAuth-Client-Id", applicationB.clientId)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject deleted users", async () => {
    const auth = await createVerifiedUser();

    const login = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .send({
        email: auth.email,
        password: auth.password,
      });

    expect(login.status).toBe(200);

    const accessToken = login.body.data.accessToken;

    await User.deleteOne({
      _id: auth.user._id,
      applicationId: auth.applicationId,
    });

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);
  });

  it("should reject inactive users", async () => {
    const auth = await createVerifiedUser();

    await User.updateOne(
      {
        _id: auth.user._id,
        applicationId: auth.applicationId,
      },
      {
        status: UserStatus.DEACTIVATED,
      },
    );

    const login = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .send({
        email: auth.email,
        password: auth.password,
      });

    expect(login.status).toBe(200);

    const accessToken = login.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);
  });
});
