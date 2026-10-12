import { describe, expect, it } from "vitest";
import request from "supertest";

import app from "../../helpers/app.js";
import { createVerifiedUser } from "../../helpers/auth.helper.js";
import { buildLoginPayload } from "../../helpers/factories.js";

describe("Browser authentication — login", () => {
  it("rejects requests without a publishable key", async () => {
    const response = await request(app)
      .post("/api/v1/browser/auth/login")
      .send(buildLoginPayload());

    expect(response.status).toBe(401);
  });

  it("rejects an invalid publishable key", async () => {
    const response = await request(app)
      .post("/api/v1/browser/auth/login")
      .set("X-DigitAuth-Publishable-Key", "dap_invalid")
      .send(buildLoginPayload());

    expect(response.status).toBe(401);
  });

  it("allows login with a valid publishable key and user credentials", async () => {
    const account = await createVerifiedUser();

    const response = await request(app)
      .post("/api/v1/browser/auth/login")
      .set("X-DigitAuth-Publishable-Key", account.publishableKey)
      .send(
        buildLoginPayload({
          email: account.email,
          password: account.password,
        }),
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("rejects incorrect user credentials even with a valid publishable key", async () => {
    const account = await createVerifiedUser();

    const response = await request(app)
      .post("/api/v1/browser/auth/login")
      .set("X-DigitAuth-Publishable-Key", account.publishableKey)
      .send(
        buildLoginPayload({
          email: account.email,
          password: "WrongPassword123!",
        }),
      );

    expect(response.status).toBe(401);
  });

  it("rejects access to the current user without an access token", async () => {
    const account = await createVerifiedUser();

    const response = await request(app)
      .get("/api/v1/browser/auth/me")
      .set("X-DigitAuth-Publishable-Key", account.publishableKey);

    expect(response.status).toBe(401);
  });
});
