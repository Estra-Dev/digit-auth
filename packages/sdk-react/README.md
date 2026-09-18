# @digit-auth/react

React SDK for building applications with DigitAuth authentication.

DigitAuth provides reusable authentication infrastructure for React applications, including authentication state, protected UI, session management, password recovery, and user account helpers.

## Installation

```bash
npm install @digit-auth/react
```

Or:

```bash
pnpm add @digit-auth/react
```

## Setup

Wrap your application with `AuthProvider`:

```tsx
import { AuthProvider } from "@digit-auth/react";

export default function App() {
  return (
    <AuthProvider apiUrl="https://your-digit-auth-api.example.com/api/v1">
      <Application />
    </AuthProvider>
  );
}
```

If `apiUrl` is omitted, the SDK uses:

```text
http://localhost:5000/api/v1
```

## Authentication

Use `useAuth()` to access authentication state and actions:

```tsx
import { useAuth } from "@digit-auth/react";

export function Profile() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p>Please sign in.</p>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>

      <button type="button" onClick={() => void logout()}>
        Sign out
      </button>
    </div>
  );
}
```

## Conditional rendering

Render content only for authenticated users:

```tsx
import { SignedIn } from "@digit-auth/react";

<SignedIn>
  <Dashboard />
</SignedIn>;
```

Render content only for unauthenticated users:

```tsx
import { SignedOut } from "@digit-auth/react";

<SignedOut>
  <SignInPage />
</SignedOut>;
```

## Protected UI

Use `ProtectedRoute` when authenticated content needs a fallback:

```tsx
import { ProtectedRoute } from "@digit-auth/react";

<ProtectedRoute loading={<p>Loading...</p>} fallback={<p>Please sign in.</p>}>
  <Dashboard />
</ProtectedRoute>;
```

`ProtectedRoute` intentionally does not perform application-level navigation. Your application remains responsible for deciding where unauthenticated users should be redirected.

## User button

The SDK includes a basic user menu:

```tsx
import { UserButton } from "@digit-auth/react";

<UserButton />;
```

You can hide the email:

```tsx
<UserButton showEmail={false} />
```

## Sign-out button

```tsx
import { SignOutButton } from "@digit-auth/react";

<SignOutButton />;
```

The button automatically prevents repeated sign-out requests while a sign-out operation is in progress.

## API client

The SDK also exposes the underlying API client:

```tsx
import { createApiClient } from "@digit-auth/react";

const api = createApiClient({
  baseUrl: "https://your-digit-auth-api.example.com/api/v1",
});
```

Example:

```tsx
const response = await api.get("/profile");

console.log(response.data);
```

API failures are represented by `ApiError`:

```tsx
import { ApiError } from "@digit-auth/react";

try {
  await api.get("/profile");
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status);
    console.log(error.message);
  }
}
```

## Authentication service

The package also exposes `createAuthService()` for applications that need direct access to the DigitAuth authentication API.

Most React applications should prefer `AuthProvider` and `useAuth()`.

## Requirements

- React 19+
- A running DigitAuth API

## Current status

DigitAuth is actively under development.

The React SDK is currently distributed as a development package and should not yet be considered a final production authentication solution.

Refresh-token storage and other production security architecture are subject to further hardening before the first stable release.

## License

MIT
