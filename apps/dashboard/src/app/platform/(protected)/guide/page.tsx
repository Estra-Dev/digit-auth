import Link from "next/link";

const reactExample = `import {
  AuthProvider,
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
  UserProfile,
  useAuth,
} from "@digit-auth/react";

export default function App() {
  return (
    <AuthProvider
      apiUrl={process.env.NEXT_PUBLIC_DIGIT_AUTH_API_URL!}
      publishableKey={
        process.env.NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY!
      }
    >
      <SignedOut>
        <SignIn />
        <SignUp />
      </SignedOut>

      <SignedIn>
        <Account />
      </SignedIn>
    </AuthProvider>
  );
}

function Account() {
  const { user } = useAuth();

  return (
    <main>
      <header>
        <p>Welcome, {user?.firstName ?? "there"}!</p>
        <UserButton userProfileUrl="/profile" />
      </header>

      <UserProfile />
    </main>
  );
}`;

const nodeExample = `import express from "express";
import {
  createDigitAuth,
  requireAuth,
  getAuth,
} from "@digit-auth/node";

const app = express();

const auth = createDigitAuth({
  apiUrl: process.env.DIGIT_AUTH_API_URL!,
  clientId: process.env.DIGIT_AUTH_CLIENT_ID!,
  clientSecret: process.env.DIGIT_AUTH_CLIENT_SECRET!,
});

app.get("/api/profile", requireAuth(auth), (req, res) => {
  const authContext = getAuth(req);

  res.json({
    user: authContext.user,
  });
});

app.listen(3001, () => {
  console.log("Application running on port 3001");
});`;

const envExample = `# Next.js client configuration
NEXT_PUBLIC_DIGIT_AUTH_API_URL=https://digit-auth.onrender.com/api/v1
NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY=your_publishable_key

# Node.js server configuration
DIGIT_AUTH_API_URL=https://digit-auth.onrender.com/api/v1
DIGIT_AUTH_CLIENT_ID=your_digit_auth_client_id
DIGIT_AUTH_CLIENT_SECRET=your_digit_auth_client_secret

# DigitAuth API deployment only
WEBHOOK_ENCRYPTION_KEY=base64_encoded_32_byte_key`;

const steps = [
  {
    number: "01",
    title: "Create an application",
    description:
      "Open Applications in the sidebar and create an application for your project. Give it a recognizable name.",
  },
  {
    number: "02",
    title: "Configure your environment",
    description:
      "Copy the application's publishable key into your client environment and configure the API URL.",
  },
  {
    number: "03",
    title: "Install an SDK",
    description:
      "Use the React SDK for authentication components or the Node SDK to protect Express API routes.",
  },
  {
    number: "04",
    title: "Integrate authentication",
    description:
      "Use SignIn, SignUp, SignedIn, SignedOut, UserButton, and UserProfile, or build custom experiences with useAuth.",
  },
  {
    number: "05",
    title: "Test your integration",
    description:
      "Test registration, sign-in, sign-out, protected routes, verification, profile management, and recovery flows.",
  },
];

const authRoutes = [
  ["Registration", "POST", "/auth/register"],
  ["Sign in", "POST", "/auth/login"],
  ["Refresh tokens", "POST", "/auth/refresh"],
  ["Sign out", "POST", "/auth/logout"],
  ["Current user", "GET", "/auth/me"],
  ["Email verification", "POST", "/auth/verify-email"],
  ["Forgot password", "POST", "/auth/forgot-password"],
  ["Reset password", "POST", "/auth/reset-password"],
  ["Session list", "GET", "/auth/sessions"],
];

const checklist = [
  "Confirm the API URL and application configuration.",
  "Test registration, login, and logout.",
  "Test email verification and password recovery.",
  "Test expired sessions and protected routes.",
  "Use HTTPS in production.",
  "Keep private credentials on trusted servers.",
  "Check user isolation and access-control rules.",
  "Review token storage and session security.",
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">
        {eyebrow}
      </p>
      <h2 className="text-xl font-semibold tracking-tight text-[var(--site-text)] sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--site-muted)]">
        {description}
      </p>
    </div>
  );
}

function CodePanel({
  title,
  language,
  code,
}: {
  title: string;
  language: string;
  code: string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--site-border)] px-4 py-3">
        <p className="text-sm font-medium text-[var(--site-text)]">{title}</p>
        <span className="rounded-md border border-[var(--site-border)] px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--site-muted)]">
          {language}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-6 text-[var(--site-text)] sm:p-5 sm:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function NumberedStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-xs font-semibold text-blue-500">
        {number}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-[var(--site-text)]">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-[var(--site-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function GettingStartedPage() {
  return (
    <main className="min-w-0 px-4 py-7 sm:px-6 sm:py-9 xl:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[var(--site-muted)]">
          <Link
            href="/platform/dashboard"
            className="transition hover:text-[var(--site-text)]"
          >
            Developer platform
          </Link>
          <span>/</span>
          <span className="text-[var(--site-text)]">Getting started</span>
        </div>

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-blue-400/20 bg-[var(--site-surface)] p-6 sm:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
          />

          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Developer documentation
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[var(--site-text)] sm:text-4xl">
              Build with DigitAuth.
              <span className="mt-1 block text-blue-500">
                Start with authentication.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--site-muted)] sm:text-base">
              Connect your application to DigitAuth, add authentication to your
              user experience, and protect your backend routes with the SDK that
              fits your stack.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/platform/applications"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                <span>Open applications</span>
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
              <a
                href="#react-sdk"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--site-border)] px-4 py-3 text-sm font-medium text-[var(--site-text)] transition hover:bg-blue-500/5"
              >
                Explore the SDKs
              </a>
            </div>
          </div>
        </section>

        <section
          aria-label="Current SDK status"
          className="mb-10 flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 sm:p-5"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-500">
            !
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[var(--site-text)]">
              Development release
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--site-muted)]">
              DigitAuth is actively under development. Validate security,
              session-storage, and deployment requirements before using it with
              real users.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <SectionHeading
            eyebrow="Your first integration"
            title="Five steps to get started"
            description="Follow this sequence to connect a project without skipping application configuration or credential handling."
          />

          <div className="grid gap-3 md:grid-cols-2">
            {steps.map((step) => (
              <NumberedStep key={step.number} {...step} />
            ))}

            <div className="flex flex-col justify-center rounded-xl border border-dashed border-blue-400/30 p-4">
              <p className="text-sm font-semibold text-[var(--site-text)]">
                Ready to configure your app?
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--site-muted)]">
                Start in your workspace, then return here to choose an SDK.
              </p>
              <Link
                href="/platform/applications"
                className="mt-3 text-sm font-medium text-blue-500 hover:text-blue-400"
              >
                Manage applications →
              </Link>
            </div>
          </div>
        </section>

        <section id="react-sdk" className="mb-12 scroll-mt-8">
          <SectionHeading
            eyebrow="Option 01"
            title="React and Next.js"
            description="Use DigitAuth's ready-made UI components or build a custom authentication experience with the SDK hooks."
          />

          <div className="mb-4 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--site-text)]">
              Install the package
            </h3>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-[var(--site-border)] bg-[var(--site-bg)] p-4 text-sm text-[var(--site-text)]">
              <code>pnpm add @digit-auth/react@0.1.4</code>
            </pre>
            <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">
              The SDK exports SignIn, SignUp, SignedIn, SignedOut, UserButton,
              UserProfile, AuthProvider, and useAuth. AuthProvider supplies the
              authentication context; useAuth lets you build custom flows.
            </p>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--site-border)] p-4">
              <h3 className="text-sm font-semibold text-[var(--site-text)]">
                Ready-made authentication
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
                Use SignIn and SignUp for authentication screens, and SignedIn
                and SignedOut to conditionally render content.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--site-border)] p-4">
              <h3 className="text-sm font-semibold text-[var(--site-text)]">
                Account UI
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
                Use UserButton for the user menu and UserProfile for the profile
                interface. Configure userProfileUrl to match your application's
                profile route.
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--site-text)]">
              Email verification
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
              Configure the verification URL to point to the correct application
              origin, and ensure the browser can reach your configured DigitAuth
              API. Before relying on automatic verification handling, confirm
              the behavior supported by the exact SDK version you have
              installed.
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
              For a custom flow, consult the installed SDK's exports and README
              before calling verification methods. Do not assume a verification
              page or helper is available unless your SDK version documents it.
            </p>
          </div>

          <CodePanel
            title="Configure your React app"
            language="tsx"
            code={reactExample}
          />

          <p className="mt-3 text-xs leading-5 text-[var(--site-muted)]">
            This example illustrates component integration. In a real
            application, place sign-in and sign-up screens according to your
            navigation, and ensure the profile URL matches your routes. The
            publishable key is intended for client-side configuration; never
            expose private server credentials.
          </p>
        </section>

        <section id="node-sdk" className="mb-12 scroll-mt-8">
          <SectionHeading
            eyebrow="Option 02"
            title="Node.js and Express"
            description="Use the Node SDK to authenticate incoming requests and apply role, permission, or resource-ownership checks in your backend."
          />

          <div className="mb-4 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--site-text)]">
              Install the packages
            </h3>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-[var(--site-border)] bg-[var(--site-bg)] p-4 text-sm text-[var(--site-text)]">
              <code>pnpm add @digit-auth/node@0.1.1 express</code>
            </pre>
          </div>

          <CodePanel
            title="Protect an Express endpoint"
            language="ts"
            code={nodeExample}
          />

          <p className="mt-3 text-xs leading-5 text-[var(--site-muted)]">
            Keep the client ID and client secret on the server. Authentication
            confirms the identity associated with a request; your application
            must still enforce authorization and resource-access policies.
          </p>
        </section>

        <section className="mb-12">
          <SectionHeading
            eyebrow="Configuration"
            title="Environment variables"
            description="Use environment-specific URLs and keep configuration separate from your application source code."
          />

          <CodePanel
            title="Example environment configuration"
            language="dotenv"
            code={envExample}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--site-border)] p-4">
              <h3 className="text-sm font-semibold text-[var(--site-text)]">
                React publishable key
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
                Vite client variables use the VITE_ prefix, while Next.js client
                variables use NEXT_PUBLIC_. Values exposed to the browser must
                contain only public configuration.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--site-border)] p-4">
              <h3 className="text-sm font-semibold text-[var(--site-text)]">
                Server credentials
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
                Keep private credentials on trusted servers, out of Git, browser
                bundles, screenshots, and logs. Set each variable only in the
                service that needs it.
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-[var(--site-muted)]">
            WEBHOOK_ENCRYPTION_KEY is configuration for the DigitAuth API
            deployment. It must be a base64-encoded 32-byte key. Do not put this
            key in your frontend environment or use it as a webhook signing
            secret.
          </p>
        </section>

        <section className="mb-12">
          <SectionHeading
            eyebrow="Events"
            title="Webhooks"
            description="Receive application events on your server and verify each delivery before processing it."
          />

          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--site-text)]">
              Configure webhook delivery
            </h3>

            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--site-muted)]">
              <li>
                Open your application and configure its webhook endpoint URL.
              </li>
              <li>Store the application's webhook signing secret securely.</li>
              <li>
                Ensure WEBHOOK_ENCRYPTION_KEY is configured in the DigitAuth API
                deployment.
              </li>
              <li>
                Register a user and check your endpoint for the user.created
                event.
              </li>
            </ol>

            <h3 className="mt-5 text-sm font-semibold text-[var(--site-text)]">
              Verify incoming requests
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
              DigitAuth signs the timestamp and exact request body using
              HMAC-SHA256. The digitauth-signature header contains a value
              formatted as sha256 followed by the hexadecimal digest. The signed
              message is the timestamp, a period, and the exact raw request
              body. The timestamp is provided in digitauth-timestamp.
            </p>

            <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">
              Verify the signature on your server using the application's
              webhook signing secret and the original raw request body, before
              parsing or processing the event. Use a constant-time comparison
              where applicable. The timestamp is part of the signed message;
              implement an explicit timestamp-age policy in your receiver if you
              need one.
            </p>

            <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">
              DigitAuth retries unsuccessful deliveries with exponential
              backoff, starting at one second and capped at one hour, for up to
              eight attempts. Redirect responses are treated as failures. Return
              a 2xx status after accepting an event, and make event processing
              idempotent so a repeated delivery does not duplicate your
              application's work.
            </p>

            <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">
              The supported event names shown in the current API source include
              user.created and user.email_verified. Check your application's
              webhook configuration and current API implementation before
              depending on a particular event payload.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <SectionHeading
            eyebrow="Before launch"
            title="Integration checklist"
            description="Use this checklist during development and again before a production rollout."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {checklist.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-[var(--site-border)] p-4"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-blue-400/30 bg-blue-500/10 text-xs text-blue-500">
                  ✓
                </span>
                <p className="text-sm leading-6 text-[var(--site-muted)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-400/20 bg-blue-500/5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[var(--site-text)]">
            Continue to your workspace
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--site-muted)]">
            Create an application, review its configuration, and use the SDK
            that matches your architecture. Refer to the README files shipped
            with the current SDK packages for version-specific API details.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/platform/applications"
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Manage applications
            </Link>
            <Link
              href="/platform/dashboard"
              className="rounded-xl border border-[var(--site-border)] px-4 py-3 text-sm font-medium text-[var(--site-text)] transition hover:bg-blue-500/5"
            >
              Back to overview
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
