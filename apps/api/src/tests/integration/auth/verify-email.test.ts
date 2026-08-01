import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { buildRegisterPayload } from "../../helpers/factories.js";

import { User } from "../../../modules/auth/model/user.model.js";
import { VerificationToken } from "../../../modules/auth/model/verification-token.model.js";

describe("POST /api/v1/auth/verify-email", () => {
  it("should verify a user's email", async () => {
    const payload = buildRegisterPayload();

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    console.log(registerResponse.body);

    expect(registerResponse.status).toBe(201);

    const verificationToken = registerResponse.body.data.verificationToken;

    const response = await request(app).post("/api/v1/auth/verify-email").send({
      token: verificationToken,
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    const verifiedUser = await User.findOne({
      email: payload.email,
    });

    expect(verifiedUser).not.toBeNull();

    expect(verifiedUser!.emailVerified).toBe(true);
  });

  it("should reject invalid token", async () => {
    const response = await request(app).post("/api/v1/auth/verify-email").send({
      token: "invalid-token",
    });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject expired verification token", async () => {});
});

// here is verifyEmail() " async verifyEmail(token: string): Promise<void> {

// Hash incoming token

// const tokenHash = tokenHashService.hash(token);

// // Find verification token

// const verificationToken =

//   await verificationTokenRepository.findByTokenHash(tokenHash);

// if (!verificationToken) {

//   throw new AppError("Invalid verification Token", 400, true);

// }

// // Mark user as verified

// await userRepository.verifyUser(verificationToken.userId);

// // Delete token

// await verificationTokenRepository.deleteById(verificationToken.id);

// }" and verify-email.test.ts " import request from "supertest";

// import { describe, expect, it } from "vitest";

// import app from "../../helpers/app.js";

// import { buildRegisterPayload } from "../../helpers/factories.js";

// import { User } from "../../../modules/auth/model/user.model.js";

// import { VerificationToken } from "../../../modules/auth/model/verification-token.model.js";

// describe("POST /api/v1/auth/verify-email", () => {

// it("should verify a user's email", async () => {

// const payload = buildRegisterPayload();

// await request(app).post("/api/v1/auth/register").send(payload);

// const user = await User.findOne({

//   email: payload.email,

// });

// expect(user).not.toBeNull();

// const token = await VerificationToken.findOne({

//   userId: user!._id,

// });

// expect(token).not.toBeNull();

// const response = await request(app).post("/api/v1/auth/verify-email").send({

//   token: token!.tokenHash,

// });

// expect(response.status).toBe(200);

// expect(response.body.success).toBe(true);

// const verifiedUser = await User.findById(user!._id);

// expect(verifiedUser?.emailVerified).toBe(true);

// });

// it("should reject invalid token", async () => {

// const response = await request(app).post("/api/v1/auth/verify-email").send({

//   token: "invalid-token",

// });

// expect(response.status).toBe(400);

// expect(response.body.success).toBe(false);

// });

// it("should reject expired verification token", async () => {});

// });

// "
