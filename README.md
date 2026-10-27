# DigitAuth

DigitAuth is an authentication platform that helps developers add user authentication and account management to their applications using reusable SDKs, UI components, and an authentication API.

Build your own authentication experience using the API, or integrate the React SDK's ready-made components into an existing application. For Express backends, the Node.js SDK provides authentication and authorization middleware.

> **Development status:** DigitAuth is actively under development. Review the current security limitations and deployment requirements before using it with real users in production.

## What DigitAuth provides

- User registration and sign-in
- Authentication state and protected UI
- Email verification and password recovery
- Session management, sign-out, and session revocation
- Ready-made React authentication components
- Custom authentication flows through SDK methods
- Profile management, password changes, and account deletion
- A developer dashboard for managing applications and configuration
- A Node.js SDK for Express authentication and authorization
- Role-based, permission-based, and resource-ownership middleware

## Project structure

- `apps/api` — authentication API
- `apps/dashboard` — DigitAuth developer dashboard
- `packages/sdk-react` — React SDK, authentication context, hooks, API client, and UI components
- `packages/sdk-node` — Node.js and Express SDK
- `packages/core` — shared authentication and authorization contracts
- Other shared packages — UI, types, and configuration

## Quick start with React

### Requirements

- React 19 or newer
- A running DigitAuth API
- A publishable key created for your DigitAuth application

### 1. Create a DigitAuth application

Sign in to your DigitAuth developer dashboard and create an application. Obtain its publishable key and configure the API URL for your environment.

The publishable key identifies the application making browser-side API requests. It is not a substitute for server-side authentication or authorization.

### 2. Install the React SDK

Using pnpm:

```bash
pnpm add @digit-auth/react
```

Or using npm:

```bash
npm install @digit-auth/react
```

**Version note:** The current repository source declares `@digit-auth/react` version `0.1.4`. The published npm version was previously observed to lag behind that source. Check the registry before integrating the current API into a separate application:

```bash
pnpm view @digit-auth/react version
pnpm view @digit-auth/react versions
```

If the published version is older than the version in this repository, do not assume it contains all the features documented here. Publish and verify the updated SDK before relying on those features in an external project.

### 3. Configure environment variables

For a Vite application, create `.env.local`:

```dotenv
VITE_DIGIT_AUTH_API_URL=http://localhost:5000/api/v1
VITE_DIGIT_AUTH_PUBLISHABLE_KEY=dap_your_publishable_key
```

Replace the example values with your actual API URL and publishable key.

Vite exposes variables prefixed with `VITE_` to browser code. Only use these variables for public configuration; never put client secrets, JWT signing secrets, or other private credentials in them.

### 4. Add `AuthProvider`

The current React SDK requires `publishableKey`. The `apiUrl` is optional and defaults to `http://localhost:5000/api/v1` when omitted.

Create a provider component:

```tsx
import type { ReactNode } from "react";
import { AuthProvider } from "@digit-auth/react";

const apiUrl = import.meta.env.VITE_DIGIT_AUTH_API_URL;
const publishableKey = import.meta.env.VITE_DIGIT_AUTH_PUBLISHABLE_KEY;

export function AppProviders({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    throw new Error("Missing VITE_DIGIT_AUTH_PUBLISHABLE_KEY.");
  }

  return (
    <AuthProvider apiUrl={apiUrl} publishableKey={publishableKey}>
      {children}
    </AuthProvider>
  );
}
```

Wrap your application with `AppProviders` at its root.

The SDK sends the publishable key using the `X-DigitAuth-Publishable-Key` request header. Authenticated requests can also include the user's bearer access token.

### 5. Use the ready-made authentication components

The current SDK exports `SignIn`, `SignUp`, `SignedIn`, `SignedOut`, `ProtectedRoute`, `SignOutButton`, `UserButton`, and `UserProfile`.

```tsx
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
  UserProfile,
} from "@digit-auth/react";

export function AccountPage() {
  return (
    <>
      <SignedOut>
        <SignIn />
        <SignUp />
      </SignedOut>

      <SignedIn>
        <UserButton userProfileUrl="/profile" />
        <UserProfile />
      </SignedIn>
    </>
  );
}
```

This example renders the sign-in and sign-up experiences for signed-out users and account controls for signed-in users. For a dedicated sign-in/sign-up switch, use your application's routing or interface controls.

The `UserButton` also supports `showEmail` and `userProfileUrl` props. `UserProfile` supports configuration for its profile, password, and account-deletion sections.

Check the component definitions in `packages/sdk-react/src/components/` for their current props and behavior.

## Custom authentication with `useAuth()`

Use `useAuth()` when you need to build your own interface instead of relying entirely on the ready-made components.

```tsx
import { useAuth } from "@digit-auth/react";

export function AccountSummary() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    logoutAll,
    refreshUser,
  } = useAuth();

  if (isLoading) {
    return <p>Loading account...</p>;
  }

  if (!isAuthenticated) {
    return <p>Please sign in to continue.</p>;
  }

  return (
    <section>
      <h2>Welcome, {user?.firstName ?? "there"}</h2>

      <button type="button" onClick={() => void refreshUser()}>
        Refresh account
      </button>

      <button type="button" onClick={() => void logout()}>
        Sign out
      </button>

      <button type="button" onClick={() => void logoutAll()}>
        Sign out all sessions
      </button>
    </section>
  );
}
```

Call `useAuth()` only inside a component rendered beneath `AuthProvider`.

The current authentication context exposes the following operations:

- `login()` and `register()` — sign-in and registration
- `logout()` and `logoutAll()` — sign out of the current or all sessions
- `refreshUser()` — refresh the current user's information
- `verifyEmail()` and `resendVerificationEmail()` — email verification operations
- `forgotPassword()` and `resetPassword()` — password recovery
- `getSessions()`, `revokeSession()`, and `revokeOtherSessions()` — session management
- `updateProfile()` — update supported profile fields
- `changePassword()` — change the account password
- `deleteAccount()` — request account deletion

The context also exposes `user`, `isAuthenticated`, `isLoading`, `authError`, and `apiClient`.

Check `packages/sdk-react/src/lib/auth/auth-context.tsx` and the authentication service for the exact parameter and return types of each operation.

## Email verification

The current React SDK's `AuthProvider` includes an automatic email-verification flow.

When a verification link directs a user to your application with a `token` query parameter, the provider:

1. Detects the verification token.
2. Removes the token from the visible URL.
3. Sends the token to the DigitAuth API for verification.
4. Displays a loading, success, or error screen.
5. Allows the user to continue after the verification result.

For this default flow, a separate page that independently consumes the same verification token is unnecessary and may cause the token to be submitted twice.

Configure the verification-email destination to point to the intended application origin. The API remains the authority on whether a verification token is valid.

For custom verification interfaces, use `verifyEmail(token)` and handle its result deliberately. Avoid running the same one-time token verification in both the provider and a separate effect.

See `packages/sdk-react/src/lib/auth/auth-context.tsx` and `packages/sdk-react/src/components/email-verification-screen` for the current implementation.

## Protect authenticated UI

Use `ProtectedRoute` to render content only when the user is authenticated:

```tsx
import { ProtectedRoute } from "@digit-auth/react";

export function PrivatePage() {
  return (
    <ProtectedRoute
      loading={<p>Checking your session...</p>}
      fallback={<p>Please sign in to continue.</p>}
    >
      <h1>Private content</h1>
    </ProtectedRoute>
  );
}
```

`ProtectedRoute` accepts `children`, `loading`, and `fallback`. It does not automatically redirect users; your application is responsible for navigation.

`SignedIn` and `SignedOut` provide conditional rendering based on authentication state.

**Important:** These components protect the client-side interface, not your backend API. A user can bypass client-side UI restrictions. Your server must independently authenticate requests and authorize sensitive operations.

## API client

The React SDK exports `ApiClient`, `createApiClient`, `ApiError`, `isApiError`, and the `ApiClientOptions` and `ApiResponse` types.

The API client requires a publishable key and accepts an optional base URL.

```tsx
import { createApiClient, ApiError } from "@digit-auth/react";

const publishableKey = import.meta.env.VITE_DIGIT_AUTH_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing DigitAuth publishable key.");
}

const api = createApiClient({
  baseUrl:
    import.meta.env.VITE_DIGIT_AUTH_API_URL || "http://localhost:5000/api/v1",
  publishableKey,
});

async function loadProfile() {
  try {
    const response = await api.get("/profile");

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("API status:", error.status);
      console.error("API message:", error.message);
    }

    throw error;
  }
}
```

The API client provides `get()`, `post()`, `put()`, `patch()`, and `delete()` methods.

Responses use the SDK's `ApiResponse<T>` structure, containing `success`, `message`, and `data`. API failures are represented by `ApiError`, which exposes `status` and `data`.

The client attaches the publishable-key header, adds the stored access token when available, and includes credentials with requests. Its current implementation also attempts an access-token refresh after an HTTP 401 response when a refresh token is available.

Use endpoints and request bodies supported by the API contract for your installed version.

## Next.js integration

The React SDK supports React applications and can be integrated into Next.js applications.

Browser-side configuration can use:

```dotenv
NEXT_PUBLIC_DIGIT_AUTH_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY=dap_your_publishable_key
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never use them for client secrets or JWT signing secrets.

Components that use hooks or browser APIs must run as Client Components. A provider wrapper can keep the configuration and client-side setup in one place:

```tsx
"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@digit-auth/react";

export function DigitAuthProvider({ children }: { children: ReactNode }) {
  const apiUrl = process.env.NEXT_PUBLIC_DIGIT_AUTH_API_URL;
  const publishableKey = process.env.NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY.");
  }

  return (
    <AuthProvider apiUrl={apiUrl} publishableKey={publishableKey}>
      {children}
    </AuthProvider>
  );
}
```

Wrap the relevant client-side provider boundary in your application's layout. Keep private credentials and server-only configuration out of client components and browser bundles.

## Node.js and Express

DigitAuth provides a separate Node.js SDK for integrating authentication and authorization into Express backends.

### Requirements

- Node.js 20 or later
- Express 5 or later
- A running DigitAuth API
- A valid DigitAuth client ID and client secret

### Installation

The repository's current Node SDK package version is `0.1.0`.

Using pnpm:

```bash
pnpm add @digit-auth/node@0.1.0 express
```

Or using npm:

```bash
npm install @digit-auth/node@0.1.0 express
```

Check published versions before upgrading:

```bash
pnpm view @digit-auth/node versions
```

### Configure the client

Create a server-side `.env` file:

```dotenv
DIGIT_AUTH_API_URL=http://localhost:5000/api/v1
DIGIT_AUTH_CLIENT_ID=your_digit_auth_client_id
DIGIT_AUTH_CLIENT_SECRET=your_digit_auth_client_secret
```

Keep the client secret on the server. Never expose it through `VITE_` or `NEXT_PUBLIC_` variables or commit it to source control.

Initialize the SDK in your backend:

```ts
import { createDigitAuth } from "@digit-auth/node";

const apiUrl = process.env.DIGIT_AUTH_API_URL;
const clientId = process.env.DIGIT_AUTH_CLIENT_ID;
const clientSecret = process.env.DIGIT_AUTH_CLIENT_SECRET;

if (!apiUrl || !clientId || !clientSecret) {
  throw new Error("Missing DigitAuth server configuration.");
}

export const digitAuth = createDigitAuth({
  apiUrl,
  clientId,
  clientSecret,
});
```

### Protect an Express endpoint

```ts
import express from "express";
import { getAuth, requireAuth } from "@digit-auth/node";
import { digitAuth } from "./lib/digit-auth.js";

const app = express();

app.get("/api/protected", requireAuth(digitAuth), (req, res) => {
  const authContext = getAuth(req);

  if (!authContext) {
    res.status(401).json({
      error: "Authentication required",
    });
    return;
  }

  res.json({
    user: authContext.user,
  });
});

app.listen(3001);
```

The consuming application sends the user's access token in the `Authorization: Bearer <token>` header. The middleware validates the user through the DigitAuth API and attaches the authentication context to the request.

The Node SDK also exports:

- `requireRole()` — role-based authorization
- `requirePermission()` — permission-based authorization
- `requireOwnership()` and `requireOwner()` — ownership checks
- `DigitAuthError` — SDK error handling
- `Permission`, `RolePermissions`, and `UserRole` — shared authorization contracts

Your application must still scope database queries and updates to the authenticated user or tenant. Authentication does not automatically isolate application data.

For full installation instructions, middleware examples, error handling, and security considerations, see [`packages/sdk-node/README.md`](./packages/sdk-node/README.md).

## Webhooks

DigitAuth can send HTTP webhook events to your application when supported events occur. The current event is `user.created`.

### Configure webhooks

1. Open your application in the DigitAuth dashboard.
2. Set the webhook endpoint URL in the application's webhook configuration.
3. Save the configuration. When a signing secret is generated, copy and store it securely; it may only be returned when first generated.
4. Configure the API's `WEBHOOK_ENCRYPTION_KEY` environment variable before enabling webhook delivery.

Generate a suitable encryption key locally:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Set the generated value in the API environment. Do not commit it or share it publicly. DigitAuth uses this key to encrypt stored webhook signing secrets. It must be a Base64-encoded 32-byte key.

### Webhook delivery

When a user is registered for an application with a configured webhook URL, DigitAuth records a `user.created` event and processes it asynchronously.

Webhook requests include:

- `digitauth-event` — the event type.
- `digitauth-delivery` — the delivery identifier.
- `digitauth-timestamp` — the signing timestamp.
- `digitauth-signature` — the HMAC-SHA256 signature.
- `Content-Type: application/json`.

The JSON payload contains `id`, `type`, `createdAt`, and `data`.

DigitAuth signs the timestamp and raw request body using the webhook signing secret. Receivers should verify the signature using the **exact raw request body**, compare signatures in constant time, and reject invalid or stale timestamps. Do not trust a webhook merely because it reached your endpoint.

### Retries and testing

- Delivery attempts time out after 10 seconds.
- Failed deliveries are retried with exponential backoff, up to eight attempts.
- Redirect responses are not followed, and successful delivery requires a 2xx response.
- Events can ultimately enter a failed state after exhausting their retries.

To test delivery, configure a temporary HTTPS endpoint such as [Webhook.site](https://webhook.site/), then register a **new user** in the application that has that webhook configured. Check the captured request and response status. Visiting the endpoint in a browser only tests a GET request; it does not prove webhook delivery.

Keep the signing secret private and rotate it if it is exposed.

## Development

DigitAuth uses pnpm workspaces.

Install the monorepo dependencies:

```bash
pnpm install
```

### React SDK checks

```bash
pnpm --filter @digit-auth/react type-check
pnpm --filter @digit-auth/react test
pnpm --filter @digit-auth/react build
pnpm --filter @digit-auth/react pack:check
```

### Node SDK checks

```bash
pnpm --filter @digit-auth/node type-check
pnpm --filter @digit-auth/node test
pnpm --filter @digit-auth/node pack:check
```

Run the API and dashboard using the scripts defined in their respective package manifests.

Before publishing a package release, verify the build, tests, type definitions, package contents, and installed-package behavior. The version in a workspace package manifest does not, by itself, mean that version has been published to npm.

## Security and production readiness

DigitAuth is a development-stage project. Before deploying an integration to production:

- Use HTTPS.
- Test registration, sign-in, sign-out, email verification, and password recovery.
- Verify token handling, refresh behavior, session expiration, and revocation.
- Keep client secrets and signing secrets on trusted servers.
- Treat access and refresh tokens as sensitive credentials.
- Enforce backend authentication and authorization independently of the frontend.
- Enforce resource ownership and tenant isolation in database queries.
- Validate user input and handle failures safely.
- Avoid logging passwords, tokens, and client secrets.
- Test unauthorized access and cross-user data access.
- Review the current API, SDK, and deployment security limitations before onboarding real users.

The SDKs provide reusable integration helpers. They do not remove the need to secure your application, protect its data, and enforce its own business rules.

## License

MIT
