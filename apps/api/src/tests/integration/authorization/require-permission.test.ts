import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import {
  loginAsAdmin,
  loginAsVerifiedUser,
} from "../../helpers/login.helper.js";

describe("Require Permission Middleware", () => {
  it("should reject anonymous users", async () => {
    const response = await request(app).get("/api/v1/test/permission/profile");

    expect(response.status).toBe(401);
  });

  it("should allow USER profile permission", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await request(app)
      .get("/api/v1/test/permission/profile")
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject USER for USER_READ permission", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await request(app)
      .get("/api/v1/test/permission/users")
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(response.status).toBe(403);
  });

  it("should allow ADMIN for USER_READ permission", async () => {
    const auth = await loginAsAdmin();

    const response = await request(app)
      .get("/api/v1/test/permission/users")
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
