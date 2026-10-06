import request from "supertest";

import app from "./app.js";

import { createAdminUser, createVerifiedUser } from "./user.factory.js";

import { buildLoginPayload } from "./factories.js";

import { withApplicationCredentials } from "./application-auth.helper.js";

async function login(
  email: string,
  password: string,
  clientId: string,
  clientSecret: string,
) {
  const response = await withApplicationCredentials(
    request(app).post("/api/v1/auth/login"),
    clientId,
    clientSecret,
  ).send(
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

  const data = await login(
    created.email,
    created.password,
    created.clientId,
    created.clientSecret,
  );

  return {
    ...created,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

export async function loginAsAdmin() {
  const created = await createAdminUser();

  const data = await login(
    created.email,
    created.password,
    created.clientId,
    created.clientSecret,
  );

  return {
    ...created,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

export function authenticatedRequest(
  accessToken: string,
  clientId: string,
  clientSecret: string,
) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "X-DigitAuth-Client-Id": clientId,
    "X-DigitAuth-Client-Secret": clientSecret,
  };

  return {
    get: (path: string) => request(app).get(path).set(headers),

    post: (path: string) => request(app).post(path).set(headers),

    patch: (path: string) => request(app).patch(path).set(headers),

    put: (path: string) => request(app).put(path).set(headers),

    delete: (path: string) => request(app).delete(path).set(headers),
  };
}
