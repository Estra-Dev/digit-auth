import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import {
  loginAsAdmin,
  loginAsVerifiedUser,
} from "../../helpers/login.helper.js";

describe("Require Role Middleware", () => {
  it("should reject unauthenticated user", async () => {
    const response = await request(app).get("/api/v1/test/admin");

    expect(response.status).toBe(401);
  });

  it("should reject normal user", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await request(app)
      .get("/api/v1/test/admin")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(response.status).toBe(403);
  });

  it("should allow admin", async () => {
    const auth = await loginAsAdmin();

    const response = await request(app)
      .get("/api/v1/test/admin")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
  });

  it("should reject an admin access token from another application", async () => {
    const applicationA = await loginAsAdmin();
    const applicationB = await loginAsVerifiedUser();

    const response = await request(app)
      .get("/api/v1/test/admin")
      .set("X-DigitAuth-Client-Id", applicationB.clientId)
      .set("Authorization", `Bearer ${applicationA.accessToken}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
