import request from "supertest";

import app from "./app.js";

import { createVerifiedUser } from "./auth.helper.js";

import { buildLoginPayload } from "./factories.js";

export async function loginAsVerifiedUser() {
  const createdUser = await createVerifiedUser();

  const response = await request(app)
    .post("/api/v1/auth/login")
    .send(
      buildLoginPayload({
        email: createdUser.email,
        password: createdUser.password,
      }),
    );

  if (response.status !== 200) {
    throw new Error("Failed to login test user.");
  }

  console.log(response.body);

  return {
    user: createdUser.user,
    email: createdUser.email,
    password: createdUser.password,

    accessToken: response.body.data.accessToken,
    refreshToken: response.body.data.refreshToken,
  };
}
