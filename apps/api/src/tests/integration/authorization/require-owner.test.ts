import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";
import {
  authenticatedRequest,
  loginAsAdmin,
  loginAsVerifiedUser,
} from "../../helpers/login.helper.js";

describe("requireOwner middleware", () => {
  it("should reject unauthenticated users", async () => {
    const response = await request(app).get("/api/v1/test/owner/123");

    expect(response.status).toBe(401);
  });

  it("should allow owner", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await authenticatedRequest(
      auth.accessToken,
      auth.clientId,
      auth.clientSecret,
    ).get(`/api/v1/test/owner/${auth.user.id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject another user", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await authenticatedRequest(
      auth.accessToken,
      auth.clientId,
      auth.clientSecret,
    ).get("/api/v1/test/owner/some-random-id");

    expect(response.status).toBe(403);
  });

  it("should allow admin", async () => {
    const admin = await loginAsAdmin();

    const response = await authenticatedRequest(
      admin.accessToken,
      admin.clientId,
      admin.clientSecret,
    ).get("/api/v1/test/owner/anything");

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
    ).get("/api/v1/test/owner/anything");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
