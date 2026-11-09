# @digit-auth/react

**Workspace version: `0.1.6`**

The React SDK for integrating DigitAuth authentication into React and Next.js applications.

It provides authentication state, ready-made UI components, protected UI helpers, and methods for implementing custom authentication and account-management experiences.

> **Development release:** The SDK is under active development. Review the project's current security limitations before using it in production.

## Requirements

- React 19 or newer
- Node.js 20 or newer for development and builds
- A running DigitAuth API
- A publishable key created for your DigitAuth application

## Installation

```bash
pnpm add @digit-auth/react@0.1.6
```

Or:

```bash
npm install @digit-auth/react@0.1.6
```

> This version must be published to npm before it can be installed from the public registry. For development inside the DigitAuth monorepo, use the workspace package.

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

For Vite, read configuration from environment variables:

```tsx
<AuthProvider
  apiUrl={import.meta.env.VITE_DIGIT_AUTH_API_URL}
  publishableKey={import.meta.env.VITE_DIGIT_AUTH_PUBLISHABLE_KEY}
>
  {children}
</AuthProvider>
```

For Next.js:

```tsx
<AuthProvider
  apiUrl={process.env.NEXT_PUBLIC_DIGIT_AUTH_API_URL}
  publishableKey={process.env.NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY!}
>
  {children}
</AuthProvider>
```

Do not put private credentials in browser-accessible environment variables. A publishable key is intended for client-side configuration; client secrets must remain on trusted servers.

### Configure the password reset route

The provider supports `passwordResetPath`, which tells the SDK which application pathname is used for password reset. Its default is `/reset-password`.

```tsx
<AuthProvider
  apiUrl={process.env.NEXT_PUBLIC_DIGIT_AUTH_API_URL}
  publishableKey={process.env.NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY!}
  passwordResetPath="/reset-password"
>
  {children}
</AuthProvider>
```

If your reset page uses a different pathname, configure that exact pathname:

```tsx
<AuthProvider
  apiUrl={process.env.NEXT_PUBLIC_DIGIT_AUTH_API_URL}
  publishableKey={process.env.NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY!}
  passwordResetPath="/account/recover"
>
  {children}
</AuthProvider>
```

The configured path must match the route rendering `ResetPassword`. Use the pathname only, without a query string or reset token.

This setting prevents the password reset token in `?token=...` from being mistaken for an email verification token.

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

## 3. Password recovery

The React SDK exports two ready-made components for password recovery:

- `ForgotPassword` requests a password reset email.
- `ResetPassword` allows the user to set a new password using the token in the reset URL.

### Forgot password page

```tsx
import { ForgotPassword } from "@digit-auth/react";

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
```

The component accepts these props:

| Prop        | Description                                               |
| ----------- | --------------------------------------------------------- |
| `signInUrl` | Destination for the sign-in link. Defaults to `/sign-in`. |
| `onSuccess` | Optional callback after the request succeeds.             |
| `className` | Optional CSS class for the component wrapper.             |

The component sends the entered email address through `useAuth().forgotPassword()`.

Its success message is intentionally generic. It does not reveal whether an account exists for the submitted email address.

### Reset password page

```tsx
import { ResetPassword } from "@digit-auth/react";

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
```

The component reads the reset token from the URL query parameter:

```text
/reset-password?token=YOUR_PASSWORD_RESET_TOKEN
```

It validates that the password and confirmation match, requires a password of at least eight characters, and submits the reset request through `useAuth().resetPassword()`.

The component accepts these props:

| Prop                | Description                                                                    |
| ------------------- | ------------------------------------------------------------------------------ |
| `signInUrl`         | Destination after successful reset. Defaults to `/sign-in`.                    |
| `forgotPasswordUrl` | Destination for requesting another reset link. Defaults to `/forgot-password`. |
| `onSuccess`         | Optional callback after a successful reset.                                    |
| `className`         | Optional CSS class for the component wrapper.                                  |

### Example application routes

For a Next.js App Router application, create these pages:

```text
app/
├── sign-in/
│   └── page.tsx
├── forgot-password/
│   └── page.tsx
└── reset-password/
    └── page.tsx
```

The forgot password page:

```tsx
import { ForgotPassword } from "@digit-auth/react";

export default function ForgotPasswordPage() {
  return <ForgotPassword signInUrl="/sign-in" />;
}
```

The reset password page:

```tsx
import { ResetPassword } from "@digit-auth/react";

export default function ResetPasswordPage() {
  return (
    <ResetPassword signInUrl="/sign-in" forgotPasswordUrl="/forgot-password" />
  );
}
```

Make sure the `AuthProvider` is configured with:

```tsx
passwordResetPath = "/reset-password";
```

The application's frontend origin must be registered in its DigitAuth allowed origins. The API uses the registered application origin when constructing the password reset link sent by email.

A reset token is temporary and must be treated as sensitive. Do not expose it in application logs or share it with other services.

## 4. Email verification

Email verification is handled automatically by `AuthProvider`.

When a user clicks the verification link sent by DigitAuth, the link opens your application with a verification token in the URL. The SDK automatically:

- Detects the verification token.
- Removes the token from the visible URL.
- Sends the token to the DigitAuth API for validation.
- Displays a loading, success, or error screen.
- Restores your application's UI when the user chooses to continue.

No custom verification page or `verifyEmail()` call is required for this default flow.

Ensure that your application's configured origin is the destination used in its verification email. The API must remain reachable by the browser, and the backend determines whether the token is valid.

For advanced integrations, `useAuth()` also exposes `verifyEmail(token)` and `resendVerificationEmail(email)` for explicit control over verification actions.

## 5. Build a custom authentication interface

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

The authentication context exposes authentication and account-management actions, including methods for:

- Signing in and signing up.
- Signing out.
- Refreshing authentication state.
- Retrieving the current user.
- Updating the user profile.
- Changing the password.
- Deleting the account.
- Verifying an email address.
- Resending an email verification message.
- Requesting a password reset.
- Resetting a password.

Check `src/lib/auth/auth-context.tsx` for the exact method signatures and behavior.

## 6. Protect authenticated UI

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

## 7. API client

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

## 8. Authentication service

The SDK also exports `createAuthService()` for integrations that need direct access to the authentication service rather than React hooks and components.

For most React applications, start with `AuthProvider` and `useAuth()`.

## 9. Next.js integration

In Next.js, components using hooks or browser-side interactions must be Client Components.

For example:

```tsx
"use client";

import { SignIn } from "@digit-auth/react";

export default function SignInPage() {
  return <SignIn />;
}
```

Keep environment configuration consistent between your application and the DigitAuth API. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and must never contain private credentials.

## Troubleshooting

**The SDK reports missing configuration**

Confirm that your API URL and publishable key are present and that your environment variables are loaded.

**Authentication state does not update**

Confirm that the component is rendered under `AuthProvider`, inspect the browser console, and check the API response.

**A password reset link is reported as invalid**

Confirm that the link contains a `token` query parameter, that it has not expired or already been used, and that `passwordResetPath` matches the pathname of your `ResetPassword` page.

**The password reset email does not open the correct application**

Confirm that the frontend origin is registered in the application's allowed origins and that the API is using the expected registered origin.

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
