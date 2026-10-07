import { describe, expect, it } from "vitest";

import { DigitAuthClient } from "../lib/digit-auth-client.js";

const apiUrl = process.env.DIGIT_AUTH_API_URL ?? "http://localhost:5000/api/v1";

const clientId = process.env.DIGIT_AUTH_CLIENT_ID;

const clientSecret = process.env.DIGIT_AUTH_CLIENT_SECRET;

const integrationConfigured = Boolean(clientId && clientSecret);

describe.skipIf(!integrationConfigured)(
  "DigitAuthClient real API integration",
  () => {
    it("should register, verify, login, and retrieve the authenticated user", async () => {
      const client = new DigitAuthClient({
        apiUrl,
        clientId: clientId!,
        clientSecret: clientSecret!,
      });

      const uniqueEmail = `sdk-test-${Date.now()}@example.com`;

      const password = "TestPassword123!";

      const registration = await client.register({
        firstName: "SDK",
        lastName: "Integration",
        email: uniqueEmail,
        password,
        confirmPassword: password,
      });

      expect(registration.id).toEqual(expect.any(String));

      expect(registration.email).toBe(uniqueEmail);

      expect(registration.emailVerified).toBe(false);

      expect(registration.verificationToken).toEqual(expect.any(String));

      await client.verifyEmail(registration.verificationToken!);

      const login = await client.login({
        email: uniqueEmail,
        password,
      });

      expect(login.accessToken).toEqual(expect.any(String));

      expect(login.refreshToken).toEqual(expect.any(String));

      expect(login.user.email).toBe(uniqueEmail);

      expect(login.user.emailVerified).toBe(true);

      const user = await client.getCurrentUser(login.accessToken);

      expect(user.id).toBe(registration.id);

      expect(user.email).toBe(uniqueEmail);

      expect(user.status).toBe("ACTIVE");
    });
  },
);
