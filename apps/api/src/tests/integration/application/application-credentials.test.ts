import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";
import { createVerifiedUser } from "../../helpers/auth.helper.js";
import { withApplicationCredentials } from "../../helpers/application-auth.helper.js";

import { Application } from "../../../modules/application/model/application.model.js";
import { ApplicationStatus } from "../../../modules/application/types/application.types.js";

describe("Application Credential Boundary", () => {
  it("should reject requests without a client ID", async () => {
    const auth = await createVerifiedUser();

    const response = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Secret", auth.clientSecret)
      .send({
        email: auth.email,
        password: auth.password,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("client ID");
  });

  it("should reject requests without a client secret", async () => {
    const auth = await createVerifiedUser();

    const response = await request(app)
      .post("/api/v1/auth/login")
      .set("X-DigitAuth-Client-Id", auth.clientId)
      .send({
        email: auth.email,
        password: auth.password,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("client secret");
  });

  it("should reject an invalid client secret", async () => {
    const auth = await createVerifiedUser();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/login"),
      auth.clientId,
      "invalid-client-secret",
    ).send({
      email: auth.email,
      password: auth.password,
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid application credentials.");
  });

  it("should reject a nonexistent client ID", async () => {
    const auth = await createVerifiedUser();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/login"),
      "da_nonexistent_application",
      auth.clientSecret,
    ).send({
      email: auth.email,
      password: auth.password,
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid application credentials.");
  });

  it("should reject a suspended application", async () => {
    const auth = await createVerifiedUser();

    await Application.updateOne(
      {
        _id: auth.applicationId,
      },
      {
        status: ApplicationStatus.SUSPENDED,
      },
    );

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/login"),
      auth.clientId,
      auth.clientSecret,
    ).send({
      email: auth.email,
      password: auth.password,
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid or inactive application.");
  });

  it("should accept valid application credentials", async () => {
    const auth = await createVerifiedUser();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/login"),
      auth.clientId,
      auth.clientSecret,
    ).send({
      email: auth.email,
      password: auth.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  });

  it("should not allow App A credentials to authenticate against App B", async () => {
    const appA = await createVerifiedUser();
    const appB = await createVerifiedUser();

    const response = await withApplicationCredentials(
      request(app).post("/api/v1/auth/login"),
      appA.clientId,
      appA.clientSecret,
    ).send({
      email: appB.email,
      password: appB.password,
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
