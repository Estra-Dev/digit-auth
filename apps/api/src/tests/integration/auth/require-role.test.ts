import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";
import {
  buildLoginPayload,
  buildRegisterPayload,
} from "../../helpers/factories.js";

import { User } from "../../../modules/auth/model/user.model.js";
import { UserRole } from "../../../authorization/roles.js";

describe("Authorization (Role Middleware)", () => {
  async function createUserAndLogin(role: UserRole = UserRole.USER) {
    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    await User.updateOne(
      { email: payload.email },
      {
        emailVerified: true,
        role,
      },
    );

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send(
        buildLoginPayload({
          email: payload.email,
          password: payload.password,
        }),
      );

    expect(login.status).toBe(200);

    return login.body.data.accessToken;
  }

  it("should allow ADMIN users", async () => {
    const accessToken = await createUserAndLogin(UserRole.ADMIN);

    const response = await request(app)
      .get("/api/v1/test/admin")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
  });

  it("should reject USER access to ADMIN routes", async () => {
    const accessToken = await createUserAndLogin(UserRole.USER);

    const response = await request(app)
      .get("/api/v1/test/admin")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);
  });

  it("should reject requests without authentication", async () => {
    const response = await request(app).get("/api/v1/test/admin");

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject invalid tokens", async () => {
    const response = await request(app)
      .get("/api/v1/test/admin")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });
});
