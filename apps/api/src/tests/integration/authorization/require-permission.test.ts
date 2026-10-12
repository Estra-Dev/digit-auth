import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";
import {
  authenticatedRequest,
  loginAsAdmin,
  loginAsVerifiedUser,
} from "../../helpers/login.helper.js";

describe("requirePermission middleware", () => {
  it("should reject unauthenticated users", async () => {
    const response = await request(app).get("/api/v1/test/permission/profile");

    expect(response.status).toBe(401);
  });

  it("should allow USER profile permission", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await authenticatedRequest(
      auth.accessToken,
      auth.clientId,
      auth.clientSecret,
    ).get("/api/v1/test/permission/profile");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject USER for USER_READ permission", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await authenticatedRequest(
      auth.accessToken,
      auth.clientId,
      auth.clientSecret,
    ).get("/api/v1/test/permission/users");

    expect(response.status).toBe(403);
  });

  it("should allow ADMIN for USER_READ permission", async () => {
    const auth = await loginAsAdmin();

    const response = await authenticatedRequest(
      auth.accessToken,
      auth.clientId,
      auth.clientSecret,
    ).get("/api/v1/test/permission/users");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject an admin access token from another application", async () => {
    const applicationA = await loginAsAdmin();
    const applicationB = await loginAsVerifiedUser();

    const response = await authenticatedRequest(
      applicationA.accessToken,
      applicationB.clientId,
      applicationB.clientSecret,
    ).get("/api/v1/test/permission/users");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
