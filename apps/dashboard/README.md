# DigitAuth Dashboard

The DigitAuth Dashboard is the web application for managing DigitAuth platform accounts, applications, authentication settings, and related platform features.

It is built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**.

## Workspace Information

| Item      | Version                   |
| --------- | ------------------------- |
| Dashboard | `0.1.0`                   |
| Next.js   | `16.3.3`                      |
| React     | `19.2.8`                      |
| React DOM | `19.2.8` |
| React SDK | `@digit-auth/react@0.1.6` |
| Node SDK  | `@digit-auth/node@0.1.1`  |
| Core SDK  | `@digit-auth/core@0.1.0`  |

These are workspace versions. SDK versions must be published to npm before they can be installed from the public registry using those exact version numbers.

## Project Structure

The dashboard uses the Next.js App Router.

```text
apps/dashboard/
├── public/
├── src/
│   ├── app/
│   │   ├── docs/
│   │   ├── platform/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── security/
│   │   └── sessions/
│   ├── components/
│   └── ...
├── package.json
└── README.md
```

The application includes public documentation and protected platform pages.

## Requirements

Before running the dashboard, ensure you have:

- Node.js 20 or later.
- pnpm.
- The DigitAuth API running and accessible.
- A valid DigitAuth publishable key for the application.
- The required environment variables configured.

## Installation

From the repository root:

```bash
pnpm install
```

Navigate to the dashboard:

```bash
cd apps/dashboard
```

## Environment Variables

Create a `.env.local` file inside `apps/dashboard`.

```env
NEXT_PUBLIC_DIGIT_AUTH_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY=your_publishable_key
```

Use the actual API URL and publishable key assigned to your DigitAuth application.

**Important:** Only public configuration should use the `NEXT_PUBLIC_` prefix. Never expose application client secrets, database credentials, webhook encryption keys, or other private credentials in frontend environment variables.

The API has its own environment configuration. Keep backend secrets in the API environment, not in the dashboard.

## Running the Dashboard

From `apps/dashboard`:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

To create a production build:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

To run lint checks, use the script configured in `apps/dashboard/package.json`:

```bash
pnpm lint
```

## Main Platform Areas

The dashboard contains the following application areas:

| Route             | Purpose                              |
| ----------------- | ------------------------------------ |
| `/`               | Dashboard application entry point    |
| `/docs`           | Public DigitAuth documentation       |
| `/platform/login` | Platform account login               |
| `/platform`       | Protected platform area              |
| `/platform/guide` | Platform setup and integration guide |
| `/dashboard`      | Dashboard overview                   |
| `/profile`        | Profile management                   |
| `/security`       | Security settings                    |
| `/sessions`       | Session management                   |

Some platform routes require an authenticated platform account.

## Authentication

The dashboard uses the DigitAuth React SDK:

```tsx
import { AuthProvider } from "@digit-auth/react";
```

The application is configured through the `AuthProvider` in the dashboard's provider setup.

The publishable key identifies the application, while authentication requests are handled by the configured DigitAuth API.

Platform authentication is separate from the authentication of users belonging to customer applications.

## Documentation

The public documentation is available at:

```text
/docs
```

The platform integration guide is available at:

```text
/platform/guide
```

The documentation covers:

- Installing the DigitAuth SDKs.
- Configuring the React authentication provider.
- User registration and login.
- Email verification.
- Forgot-password and password-reset flows.
- Node.js API integration.
- Webhook configuration and signature verification.

## Development Guidelines

When modifying the dashboard:

1. Follow the existing Next.js App Router structure.
2. Reuse existing components and styling conventions.
3. Keep platform authentication separate from customer application authentication.
4. Never expose private credentials in client-side code.
5. Keep public documentation and the platform integration guide synchronized with actual SDK and API behavior.
6. Update relevant documentation whenever an API, SDK, environment variable, or dashboard feature changes.
7. Run the relevant type checks, tests, and production build before committing changes.

## Related Packages

DigitAuth is maintained as a pnpm monorepo.

| Package      | Location             |
| ------------ | -------------------- |
| React SDK    | `packages/sdk-react` |
| Node SDK     | `packages/sdk-node`  |
| Core package | `packages/core`      |
| API          | `apps/api`           |
| Dashboard    | `apps/dashboard`     |

For repository-wide information, setup instructions, and API documentation, see the root [`README.md`](../../README.md).

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/learn)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
