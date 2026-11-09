import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../../helpers/app.js";
import { ApplicationService } from "../../../modules/application/service/application.service.js";
import { testEmailProvider } from "../../../modules/email/index.js";
import { buildRegisterPayload } from "../../helpers/factories.js";
import { getTestWorkspace } from "../../helpers/workspace.helper.js";
import { withApplicationCredentials } from "../../helpers/application-auth.helper.js";

const applicationService = new ApplicationService();

const frontendOrigin = "https://projectvault.example.com";

async function createTestApplication() {
  const workspace = await getTestWorkspace();

  const { application, credentials } =
    await applicationService.createApplication(
      workspace.id,
      "DigitAuth Test Application",
    );

  await applicationService.updateApplicationAllowedOrigins(
    workspace.id,
    application.id,
    [frontendOrigin],
  );

  return {
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
  };
}

describe("POST /api/v1/auth/forgot-password", () => {
  beforeEach(() => {
    testEmailProvider.sentEmails.length = 0;
  });

  it("should generate a reset token and send the reset link to the registered application origin", async () => {
    const { clientId, clientSecret } = await createTestApplication();
    const payload = buildRegisterPayload();

    const registerResponse = await withApplicationCredentials(
      request(app).post("/api/v1/auth/register"),
      clientId,
      clientSecret,
    ).send(payload);

    expect(registerResponse.status).toBe(201);

    // Ignore the registration verification email.
    testEmailProvider.sentEmails.length = 0;

    const response = await withApplicationCredentials(
      request(app)
        .post("/api/v1/auth/forgot-password")
        .set("Origin", frontendOrigin),
      clientId,
      clientSecret,
    ).send({ email: payload.email });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.resetToken).toBeDefined();

    expect(testEmailProvider.sentEmails).toHaveLength(1);

    const sentEmail = testEmailProvider.sentEmails[0];

    expect(sentEmail?.to).toBe(payload.email);
    expect(sentEmail?.subject).toBeTruthy();

    const expectedResetUrl =
      `${frontendOrigin}/reset-password?token=` +
      encodeURIComponent(response.body.data.resetToken);

    expect(sentEmail?.html).toContain(expectedResetUrl);
    expect(sentEmail?.html).not.toContain("localhost");
  });

  it("should return success even for an unknown email", async () => {
    const { clientId, clientSecret } = await createTestApplication();

    const response = await withApplicationCredentials(
      request(app)
        .post("/api/v1/auth/forgot-password")
        .set("Origin", frontendOrigin),
      clientId,
      clientSecret,
    ).send({ email: "unknown@example.com" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Unknown accounts must not receive an email.
    expect(testEmailProvider.sentEmails).toHaveLength(0);
  });
});
