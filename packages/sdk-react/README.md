# @digit-auth/react

The React SDK for integrating DigitAuth authentication into React and Next.js applications.

It provides authentication state, ready-made UI components, protected UI helpers, and methods for implementing custom authentication and account-management experiences.

> **Development release:** The SDK is under active development. Review the project's current security limitations before using it in production.

## Requirements

- React 19 or newer
- A running DigitAuth API
- A publishable key created for your DigitAuth application

## Installation

```bash
npm install @digit-auth/react
```

Or:

```bash
pnpm add @digit-auth/react
```

## 1. Configure the provider

Wrap your application with `AuthProvider`.

```tsx
import { AuthProvider } from "@digit-auth/react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider
      apiUrl="http://localhost:5000/api/v1"
      publishableKey="dap_your_publishable_key"
    >
      {children}
    </AuthProvider>
  );
}
```

Replace the example URL and key with the values for your environment.

If `apiUrl` is omitted, the SDK defaults to:

```text
http://localhost:5000/api/v1
```

For Vite, you can read the configuration from environment variables:

```tsx
<AuthProvider
  apiUrl={import.meta.env.VITE_DIGIT_AUTH_API_URL}
  publishableKey={import.meta.env.VITE_DIGIT_AUTH_PUBLISHABLE_KEY}
>
  {children}
</AuthProvider>
```

Do not put private credentials in browser-accessible environment variables.

## 2. Use the ready-made UI components

### Sign in

```tsx
import { SignIn } from "@digit-auth/react";

export function SignInPage() {
  return <SignIn />;
}
```

### Sign up

```tsx
import { SignUp } from "@digit-auth/react";

export function SignUpPage() {
  return <SignUp />;
}
```

Use your application's routes or interface controls to switch between sign-in and sign-up.

### Render content based on authentication state

```tsx
import { SignedIn, SignedOut } from "@digit-auth/react";

export function AccountArea() {
  return (
    <>
      <SignedOut>
        <p>Please sign in to access your account.</p>
      </SignedOut>

      <SignedIn>
        <p>You are signed in.</p>
      </SignedIn>
    </>
  );
}
```

### User button

```tsx
import { UserButton } from "@digit-auth/react";

export function AccountMenu() {
  return <UserButton />;
}
```

To hide the email address:

```tsx
<UserButton showEmail={false} />
```

To configure the profile destination:

```tsx
<UserButton userProfileUrl="/profile" />
```

### User profile

```tsx
import { UserProfile } from "@digit-auth/react";

export function ProfilePage() {
  return <UserProfile />;
}
```

The profile component provides the SDK's ready-made profile experience. Check the current implementation for the available profile actions and behavior.

### Sign-out button

```tsx
import { SignOutButton } from "@digit-auth/react";

export function LogoutControl() {
  return <SignOutButton />;
}
```

The component prevents repeated sign-out requests while a sign-out operation is in progress.

## 3. Build a custom authentication interface

Use `useAuth()` when you need more control over your application's interface.

```tsx
import { useAuth } from "@digit-auth/react";

export function AccountSummary() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p>You are not signed in.</p>;
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

Call `useAuth()` only within a component rendered underneath `AuthProvider`.

The current SDK exposes authentication and account-management actions, including methods for refreshing the user, updating the profile, changing the password, and deleting the account. Check `src/lib/auth/auth-context.tsx` for their exact signatures and behavior.

## 4. Protect authenticated UI

Use `ProtectedRoute` when content should only be rendered for authenticated users.

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

`ProtectedRoute` does not perform application-level navigation. Your application remains responsible for redirecting users when needed.

These UI helpers do not replace server-side authorization. Your backend must verify requests and enforce access rules independently.

## 5. API client

The SDK exposes `createApiClient()` for making requests to the DigitAuth API.

```tsx
import { createApiClient } from "@digit-auth/react";

const api = createApiClient({
  baseUrl: "http://localhost:5000/api/v1",
  publishableKey: "dap_your_publishable_key",
});

const response = await api.get("/profile");

console.log(response.data);
```

Use the API client according to the current API contract and the requirements of each endpoint.

### Handling API errors

```tsx
import { ApiError } from "@digit-auth/react";

try {
  const response = await api.get("/profile");
  console.log(response.data);
} catch (error) {
  if (error instanceof ApiError) {
    console.error("API status:", error.status);
    console.error("API message:", error.message);
  } else {
    throw error;
  }
}
```

## 6. Authentication service

The SDK also exports `createAuthService()` for integrations that need direct access to the authentication service rather than React hooks and components.

For most React applications, start with `AuthProvider` and `useAuth()`.

## 7. Next.js integration

In Next.js, components using hooks or browser-side interactions must be Client Components.

Keep environment configuration consistent between your application and the DigitAuth API. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and must never contain private credentials.

## Troubleshooting

**The SDK reports missing configuration**

Confirm that your API URL and publishable key are present and that your environment variables are loaded.

**Authentication state does not update**

Confirm that the component is rendered under `AuthProvider`, inspect the browser console, and check the API response.

**A protected page still needs authorization**

UI protection controls what the client renders. Your backend must independently authenticate the request and authorize the requested operation.

**A request fails**

Check the API URL, application configuration, network response, and API error message. Ensure the API is running and reachable from your development environment.

## Development commands

From the DigitAuth monorepo root:

```bash
pnpm --filter @digit-auth/react type-check
pnpm --filter @digit-auth/react test
pnpm --filter @digit-auth/react build
```

## License

MIT
