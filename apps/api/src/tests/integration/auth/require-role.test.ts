import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";
import { createVerifiedUser } from "../../helpers/auth.helper.js";
import { withApplicationCredentials } from "../../helpers/application-auth.helper.js";

import { User } from "../../../modules/auth/model/user.model.js";
import { UserRole } from "../../../authorization/roles.js";

describe("Authorization (Role Middleware)", () => {
  async function createUserAndLogin(role: UserRole = UserRole.USER) {
    const auth = await createVerifiedUser();

    await User.updateOne(
      {
        _id: auth.user._id,
        applicationId: auth.applicationId,
      },
      {
        role,
      },
    );

    const login = await withApplicationCredentials(
      request(app).post("/api/v1/auth/login"),
      auth.clientId,
      auth.clientSecret,
    ).send({
      email: auth.email,
      password: auth.password,
    });

    expect(login.status).toBe(200);

    return {
      accessToken: login.body.data.accessToken,
      clientId: auth.clientId,
      clientSecret: auth.clientSecret,
    };
  }

  it("should allow ADMIN users", async () => {
    const auth = await createUserAndLogin(UserRole.ADMIN);

    const response = await withApplicationCredentials(
      request(app).get("/api/v1/test/admin"),
      auth.clientId,
      auth.clientSecret,
    ).set("Authorization", `Bearer ${auth.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject USER access to ADMIN routes", async () => {
    const auth = await createUserAndLogin(UserRole.USER);

    const response = await withApplicationCredentials(
      request(app).get("/api/v1/test/admin"),
      auth.clientId,
      auth.clientSecret,
    ).set("Authorization", `Bearer ${auth.accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should reject requests without authentication", async () => {
    const auth = await createVerifiedUser();

    const response = await withApplicationCredentials(
      request(app).get("/api/v1/test/admin"),
      auth.clientId,
      auth.clientSecret,
    );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject invalid tokens", async () => {
    const auth = await createVerifiedUser();

    const response = await withApplicationCredentials(
      request(app).get("/api/v1/test/admin"),
      auth.clientId,
      auth.clientSecret,
    ).set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
