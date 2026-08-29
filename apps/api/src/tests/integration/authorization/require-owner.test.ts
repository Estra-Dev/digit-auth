import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";
import {
  loginAsAdmin,
  loginAsVerifiedUser,
} from "../../helpers/login.helper.js";

describe("Require Owner Middleware", () => {
  it("should reject anonymous users", async () => {
    const response = await request(app).get("/api/v1/test/owner/123");

    expect(response.status).toBe(401);
  });

  it("should allow owner", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await request(app)
      .get(`/api/v1/test/owner/${auth.user.id}`)
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject another user", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await request(app)
      .get("/api/v1/test/owner/some-random-id")
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(response.status).toBe(403);
  });

  it("should allow admin", async () => {
    const admin = await loginAsAdmin();

    const response = await request(app)
      .get("/api/v1/test/owner/anything")
      .set("Authorization", `Bearer ${admin.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
