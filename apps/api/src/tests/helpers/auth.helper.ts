import request from "supertest";

import app from "./app.js";

import { User } from "../../modules/auth/model/user.model.js";

import { buildRegisterPayload } from "./factories.js";

export async function createVerifiedUser(
  overrides: Partial<ReturnType<typeof buildRegisterPayload>> = {},
) {
  const payload = buildRegisterPayload(overrides);

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
  }).select("+passwordHashed");

  if (!user) {
    throw new Error("Failed to create test user.");
  }

  return {
    user,
    password: payload.password,
    email: payload.email,
  };
}

export {
  createUser,
  createAdminUser,
  createInactiveUser,
  createUnverifiedUser,
} from "./user.factory.js";
