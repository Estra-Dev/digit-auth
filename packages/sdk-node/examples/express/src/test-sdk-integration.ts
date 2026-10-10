import "dotenv/config";

import { createDigitAuth, DigitAuthError } from "@digit-auth/node";

const apiUrl = process.env.DIGIT_AUTH_API_URL;
const clientId = process.env.DIGIT_AUTH_CLIENT_ID;
const clientSecret = process.env.DIGIT_AUTH_CLIENT_SECRET;

if (!apiUrl || !clientId || !clientSecret) {
  throw new Error("DigitAuth environment variables are missing.");
}

const auth = createDigitAuth({
  apiUrl,
  clientId,
  clientSecret,
});

const email = `sdk-${Date.now()}@example.com`;
const password = "TestPassword123!";

async function main() {
  console.log("1. Registering SDK test user...");

  const registration = await auth.client.register({
    firstName: "SDK",
    lastName: "Test",
    email,
    password,
    confirmPassword: password,
  });

  console.log("✓ SDK REGISTRATION SUCCESS");
  console.log({
    userId: registration.id,
    email: registration.email,
    emailVerified: registration.emailVerified,
    verificationTokenReceived: Boolean(registration.verificationToken),
  });

  if (!registration.verificationToken) {
    throw new Error("Verification token was not returned in test mode.");
  }

  console.log("2. Verifying email...");

  await auth.client.verifyEmail(registration.verificationToken);

  console.log("✓ SDK EMAIL VERIFICATION SUCCESS");

  console.log("3. Logging in...");

  const login = await auth.client.login({
    email,
    password,
  });

  console.log("✓ SDK LOGIN SUCCESS");
  console.log({
    userId: login.user.id,
    email: login.user.email,
    role: login.user.role,
    status: login.user.status,
    accessTokenReceived: Boolean(login.accessToken),
    refreshTokenReceived: Boolean(login.refreshToken),
  });

  console.log("5. Testing live Express authorization routes...");

  const exampleUrl = "http://localhost:3000";

  async function checkRoute(
    path: string,
    expectedStatus: number,
    accessToken?: string,
  ) {
    const headers = new Headers();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(`${exampleUrl}${path}`, { headers });

    const body = await response.json();

    if (response.status !== expectedStatus) {
      throw new Error(
        `${path}: expected HTTP ${expectedStatus}, received ${response.status}. Response: ${JSON.stringify(body)}`,
      );
    }

    console.log(`✓ ${path} returned HTTP ${response.status}`);
  }

  // Authentication required.
  await checkRoute("/me", 401);

  // Normal USER can authenticate and read their profile.
  await checkRoute("/me", 200, login.accessToken);
  await checkRoute("/profile", 200, login.accessToken);

  // Normal USER must not access the admin route.
  await checkRoute("/admin", 403, login.accessToken);

  // Ownership: own resource allowed, another user's denied.
  await checkRoute(`/users/${login.user.id}`, 200, login.accessToken);

  await checkRoute("/users/another-user-456", 403, login.accessToken);

  console.log("✓ LIVE AUTHORIZATION ROUTE TESTS PASSED");

  console.log("4. Fetching current user...");

  const currentUser = await auth.client.getCurrentUser(login.accessToken);

  console.log("✓ SDK GET CURRENT USER SUCCESS");
  console.log({
    id: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
    status: currentUser.status,
    emailVerified: currentUser.emailVerified,
  });

  console.log("");
  console.log("========================================");
  console.log("SDK INTEGRATION TEST PASSED");
  console.log("========================================");
}

main().catch((error) => {
  console.error("");
  console.error("SDK INTEGRATION TEST FAILED");

  if (error instanceof DigitAuthError) {
    console.error({
      message: error.message,
      status: error.status,
      code: error.code,
    });
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});
