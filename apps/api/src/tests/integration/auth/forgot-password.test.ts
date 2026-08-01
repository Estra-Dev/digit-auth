import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { buildRegisterPayload } from "../../helpers/factories.js";

describe("POST /api/v1/auth/forgot-password", () => {
  it("should generate a reset token", async () => {
    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: payload.email,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.resetToken).toBeDefined();
  });

  it("should return success even for unknown email", async () => {
    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({
        email: "unknown@example.com",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
  });
});
