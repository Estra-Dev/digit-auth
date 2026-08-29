import request from "supertest";

import app from "../../helpers/app.js";
import { loginAsVerifiedUser } from "../../helpers/login.helper.js";

import { describe, expect, it } from "vitest";

describe("GET /api/v1/security/events", () => {
  it("should return current user's security events", async () => {
    const auth = await loginAsVerifiedUser();

    const response = await request(app)
      .get("/api/v1/security/events")
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("should reject unauthenticated users", async () => {
    const response = await request(app).get("/api/v1/security/events");

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should only return security events belonging to the current user", async () => {
    const firstUser = await loginAsVerifiedUser();
    const secondUser = await loginAsVerifiedUser();

    const firstResponse = await request(app)
      .get("/api/v1/security/events")
      .set("Authorization", `Bearer ${firstUser.accessToken}`);

    const secondResponse = await request(app)
      .get("/api/v1/security/events")
      .set("Authorization", `Bearer ${secondUser.accessToken}`);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);

    expect(firstResponse.body.success).toBe(true);
    expect(secondResponse.body.success).toBe(true);

    expect(Array.isArray(firstResponse.body.data)).toBe(true);
    expect(Array.isArray(secondResponse.body.data)).toBe(true);

    for (const event of firstResponse.body.data) {
      expect(event.userId.toString()).toBe(firstUser.user._id.toString());
    }

    for (const event of secondResponse.body.data) {
      expect(event.userId.toString()).toBe(secondUser.user._id.toString());
    }
  });
});
