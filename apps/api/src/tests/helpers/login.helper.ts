import request from "supertest";

import app from "./app.js";

import { createAdminUser, createVerifiedUser } from "./user.factory.js";

import { buildLoginPayload } from "./factories.js";

async function login(email: string, password: string) {
  const response = await request(app).post("/api/v1/auth/login").send(
    buildLoginPayload({
      email,
      password,
    }),
  );

  if (response.status !== 200) {
    throw new Error(
      `Failed to login. Status: ${response.status}. Response: ${JSON.stringify(
        response.body,
      )}`,
    );
  }

  return response.body.data;
}

export async function loginAsVerifiedUser() {
  const created = await createVerifiedUser();

  const data = await login(created.email, created.password);

  return {
    ...created,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

export async function loginAsAdmin() {
  const created = await createAdminUser();

  const data = await login(created.email, created.password);

  return {
    ...created,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}
