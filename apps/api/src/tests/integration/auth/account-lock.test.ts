import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";
import { buildLoginPayload } from "../../helpers/factories.js";
import { createVerifiedUser } from "../../helpers/auth.helper.js";
import { User } from "../../../modules/auth/model/user.model.js";

describe("POST /api/v1/auth/login - Account Lock", () => {
  it("should lock the account after 5 failed login attempts", async () => {
    const createdUser = await createVerifiedUser();

    const invalidPassword = "WrongPassword123@";

    for (let attempt = 1; attempt <= 5; attempt++) {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .set("X-DigitAuth-Client-Id", createdUser.clientId)
        .send(
          buildLoginPayload({
            email: createdUser.email,
            password: invalidPassword,
          }),
        );

      if (attempt < 5) {
        expect(response.status).toBe(401);
      } else {
        expect(response.status).toBe(423);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("locked");
      }
    }

    const user = await User.findOne({
      _id: createdUser.user._id,
      applicationId: createdUser.applicationId,
      email: createdUser.email,
    });

    expect(user).not.toBeNull();
    expect(user?.failedLoginAttempts).toBe(5);
    expect(user?.lockedUntil).not.toBeNull();
    expect(user?.lockedUntil?.getTime()).toBeGreaterThan(Date.now());
  });

  it("should reject login while the account is locked", async () => {
    const createdUser = await createVerifiedUser();

    await User.updateOne(
      {
        _id: createdUser.user._id,
        applicationId: createdUser.applicationId,
        email: createdUser.email,
      },
      {
        failedLoginAttempts: 5,
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
      },
    );

    const response = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", createdUser.clientId)
      .send(
        buildLoginPayload({
          email: createdUser.email,
          password: createdUser.password,
        }),
      );

    expect(response.status).toBe(423);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("locked");
  });

  it("should reset failed login attempts after a successful login", async () => {
    const createdUser = await createVerifiedUser();

    await User.updateOne(
      {
        _id: createdUser.user._id,
        applicationId: createdUser.applicationId,
        email: createdUser.email,
      },
      {
        failedLoginAttempts: 3,
      },
    );

    const response = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", createdUser.clientId)
      .send(
        buildLoginPayload({
          email: createdUser.email,
          password: createdUser.password,
        }),
      );

    expect(response.status).toBe(200);

    const user = await User.findOne({
      _id: createdUser.user._id,
      applicationId: createdUser.applicationId,
      email: createdUser.email,
    });

    expect(user?.failedLoginAttempts).toBe(0);
    expect(user?.lockedUntil).toBeNull();
  });
});
