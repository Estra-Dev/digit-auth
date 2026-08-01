import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { buildRegisterPayload } from "../../helpers/factories.js";

import { User } from "../../../modules/auth/model/user.model.js";
import { VerificationToken } from "../../../modules/auth/model/verification-token.model.js";

describe("POST /api/v1/auth/resend-verification-email", () => {
  it("should resend verification email", async () => {
    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    const user = await User.findOne({
      email: payload.email,
    });

    expect(user).not.toBeNull();

    const oldToken = await VerificationToken.findOne({
      userId: user!._id,
    }).select("+tokenHash");

    expect(oldToken).not.toBeNull();

    const response = await request(app)
      .post("/api/v1/auth/resend-verification-email")
      .send({
        email: payload.email,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    const newToken = await VerificationToken.findOne({
      userId: user!._id,
    }).select("+tokenHash");

    expect(newToken).not.toBeNull();

    expect(newToken!.tokenHash).not.toBe(oldToken!.tokenHash);
  });

  it("should return success for unknown email", async () => {
    const response = await request(app)
      .post("/api/v1/auth/resend-verification-email")
      .send({
        email: "unknown@example.com",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);
  });

  it("should not resend verification email for verified user", async () => {
    const payload = buildRegisterPayload();

    await request(app).post("/api/v1/auth/register").send(payload);

    await User.updateOne(
      {
        email: payload.email,
      },
      {
        emailVerified: true,
      },
    );

    const user = await User.findOne({
      email: payload.email,
    });

    await VerificationToken.deleteMany({
      userId: user!._id,
    });

    const response = await request(app)
      .post("/api/v1/auth/resend-verification-email")
      .send({
        email: payload.email,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(
      await VerificationToken.countDocuments({
        userId: user!._id,
      }),
    ).toBe(0);
  });
});
