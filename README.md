# DigitAuth

DigitAuth is an authentication platform that helps developers add user authentication and account management to their applications using reusable SDKs and UI components.

Build your own application experience with the authentication API, or use the React SDK's ready-made components to get started faster.

> **Development status:** DigitAuth is actively under development. Review the current security and deployment limitations before using it with real users in production.

## What DigitAuth provides

- User registration and sign-in
- Authentication state and protected UI
- Email verification and password recovery flows
- Session management and sign-out
- Ready-made React authentication components
- Custom authentication flows through SDK methods
- A developer dashboard for managing applications and their configuration

## Project structure

- `apps/api` — authentication API
- `apps/dashboard` — DigitAuth developer dashboard
- `packages/sdk-react` — React SDK, authentication hooks, and UI components
- `packages/sdk-node` — Node.js SDK
- `packages/core` — shared authentication functionality
- Other shared packages — UI, types, and configuration

## Quick start with React

### 1. Create an application

Sign in to your DigitAuth developer dashboard and create an application. Copy its publishable key and configure the API URL for your environment.

### 2. Install the SDK

```bash
npm install @digit-auth/react
```

Or:

```bash
pnpm add @digit-auth/react
```

### 3. Configure environment variables

For a Vite application, create `.env.local`:

```dotenv
VITE_DIGIT_AUTH_API_URL=http://localhost:5000/api/v1
VITE_DIGIT_AUTH_PUBLISHABLE_KEY=your_publishable_key
```

Use the appropriate API URL for your deployment. Vite variables prefixed with `VITE_` are exposed to the browser, so never put private credentials in them.

### 4. Add the provider

```tsx
import { AuthProvider } from "@digit-auth/react";

const apiUrl = import.meta.env.VITE_DIGIT_AUTH_API_URL;
const publishableKey = import.meta.env.VITE_DIGIT_AUTH_PUBLISHABLE_KEY;

export function AppProviders({ children }: { children: React.ReactNode }) {
  if (!apiUrl || !publishableKey) {
    throw new Error("Missing DigitAuth configuration.");
  }

  return (
    <AuthProvider apiUrl={apiUrl} publishableKey={publishableKey}>
      {children}
    </AuthProvider>
  );
}
```

Wrap your application with `AppProviders` at its root.

### 5. Use the authentication UI

The React SDK includes ready-made components for common authentication experiences.

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
      </SignedOut>

      <SignedIn>
        <UserButton userProfileUrl="/profile" />
        <UserProfile />
      </SignedIn>
    </>
  );
}
```

Use your application's routing or a sign-in/sign-up switch to let users choose between the `SignIn` and `SignUp` experiences. The example above demonstrates the signed-out and signed-in states; it does not implement that switch.

Check the component exports and their current props in `packages/sdk-react/README.md` and the SDK source.

## Custom authentication

If you need a custom interface, use `useAuth()` inside a component rendered under `AuthProvider`.

```tsx
import { useAuth } from "@digit-auth/react";

export function AccountSummary() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <p>Loading account...</p>;
  }

  if (!isAuthenticated) {
    return <p>Please sign in to continue.</p>;
  }

  return (
    <section>
      <h2>Welcome, {user?.firstName ?? "there"}</h2>

      <button type="button" onClick={() => void logout()}>
        Sign out
      </button>
    </section>
  );
}
```

The SDK also provides authentication actions and account-management methods. Refer to the current SDK implementation for supported arguments and behavior.

## Next.js

For Next.js applications, configure the provider with environment variables appropriate to the runtime.

Browser-accessible configuration can use variables prefixed with `NEXT_PUBLIC_`:

```dotenv
NEXT_PUBLIC_DIGIT_AUTH_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY=your_publishable_key
```

Components that use React hooks or browser interactions must run as Client Components. Keep private credentials and server-only configuration out of client components and browser bundles.

## Node.js and Express

DigitAuth also contains a Node.js SDK. See `packages/sdk-node/README.md` for its installation instructions, middleware, and integration examples. Verify the current package API before using it in an application.

## Development

This repository uses pnpm workspaces.

Common commands:

```bash
pnpm install
pnpm --filter @digit-auth/react type-check
pnpm --filter @digit-auth/react test
pnpm --filter @digit-auth/react build
```

Run the API and dashboard using the scripts defined in their respective package manifests.

## Security and production readiness

DigitAuth is a development-stage project. Before deploying an integration to production:

- Use HTTPS.
- Test registration, sign-in, sign-out, email verification, and password recovery.
- Verify token handling, session expiration, and revocation.
- Keep private credentials on trusted servers.
- Enforce authorization and resource ownership in your own backend.
- Confirm that application users and their data remain properly isolated.
- Review the current implementation's security limitations.

## License

MIT
