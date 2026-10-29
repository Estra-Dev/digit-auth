import Link from "next/link";
import SiteHeader from "@/components/site-header";

const features = [
  {
    number: "01",
    title: "Authentication essentials",
    description:
      "Give your application the sign-up, sign-in, password recovery, and email-verification flows it needs.",
    tags: ["Sign up", "Sign in", "Email verification"],
  },
  {
    number: "02",
    title: "A developer-first SDK",
    description:
      "Integrate authentication into your React application with reusable components, an AuthProvider, and the useAuth hook.",
    tags: ["React SDK", "AuthProvider", "useAuth"],
  },
  {
    number: "03",
    title: "Session management",
    description:
      "Support authenticated experiences with access tokens, refresh tokens, and session-management capabilities.",
    tags: ["Access tokens", "Refresh tokens", "Sessions"],
  },
  {
    number: "04",
    title: "A central platform",
    description:
      "Manage your DigitAuth applications and access platform tools from one developer dashboard.",
    tags: ["Applications", "Dashboard", "Webhooks"],
  },
];

const supportedFeatures = [
  "Email and password registration",
  "Email and password sign-in",
  "Email verification",
  "Password reset and recovery",
  "Access and refresh tokens",
  "Session management",
  "User profile integration",
  "React authentication SDK",
  "Node.js authentication SDK",
  "Platform application management",
  "Webhook configuration and delivery",
];

const roadmapFeatures = [
  {
    title: "Social sign-in",
    description:
      "Let users authenticate through supported third-party identity providers.",
    status: "Planned",
  },
  {
    title: "Multi-factor authentication",
    description:
      "Add an additional verification step to strengthen account security.",
    status: "Planned",
  },
];

const securityItems = [
  {
    title: "Token-based authentication",
    description:
      "DigitAuth issues access and refresh tokens. The React SDK stores them using its configured token-storage mechanism.",
  },
  {
    title: "Session expiry",
    description:
      "The configured session lifetime defaults to 30 days and can be adjusted through the API's session-expiry setting.",
  },
  {
    title: "Rate limiting",
    description:
      "Rate limits are applied to authentication-sensitive endpoints, including registration, sign-in, token refresh, and password-recovery flows.",
  },
  {
    title: "Server-side credential protection",
    description:
      "Keep application client secrets on the server. Never expose private credentials in browser code or NEXT_PUBLIC environment variables.",
  },
];

const reactExample = `pnpm add @digit-auth/react

// app/providers.tsx
import { AuthProvider } from "@digit-auth/react";

export function Providers({ children }) {
  return (
    <AuthProvider
      apiUrl={process.env.NEXT_PUBLIC_DIGIT_AUTH_API_URL!}
      publishableKey={process.env.NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY!}
    >
      {children}
    </AuthProvider>
  );
}

// In a client component
const { isSignedIn, user } = useAuth();`;

const environmentExample = `NEXT_PUBLIC_DIGIT_AUTH_API_URL=https://digit-auth.onrender.com/api/v1
NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY=your_publishable_key`;

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M4.167 10h11.666M10 4.167 15.833 10 10 15.833"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
    >
      <path
        d="m4.5 10.25 3.5 3.5 7.5-7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
      <span className="h-px w-6 bg-blue-500" />
      {children}
    </p>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--site-bg)] text-[var(--site-text)]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden="true"
          className="hero-glow pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-[120px]"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-2 lg:px-10">
          {/* Animated hero content */}
          <div className="motion-hero">
            <div className="hero-badge mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              Authentication infrastructure for developers
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Authentication,
              <span className="block bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                built for your next idea.
              </span>
            </h1>

            <p className="hero-description mt-7 max-w-xl text-lg leading-8">
              Build and manage authentication for your applications with
              DigitAuth. Spend less time rebuilding authentication
              infrastructure and more time building products that matter.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/platform/register"
                className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-500"
              >
                Get started <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/docs"
                className="secondary-button rounded-xl border px-6 py-3.5 text-sm font-semibold transition duration-300 hover:-translate-y-1"
              >
                Read the documentation
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
              {["React SDK", "Node.js SDK", "Session management"].map(
                (item, index) => (
                  <span
                    key={item}
                    className="hero-muted inline-flex items-center gap-2 text-sm"
                    style={{
                      animation: `digit-fade-up 600ms ease-out ${
                        350 + index * 150
                      }ms both`,
                    }}
                  >
                    <span className="text-emerald-500">✓</span>
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Animated dashboard and orbit system */}
          <div className="motion-dashboard relative mx-auto w-full max-w-xl">
            <div className="dashboard-orbits" aria-hidden="true">
              <div className="orbit orbit-one">
                <span className="orbit-particle particle-one" />
              </div>

              <div className="orbit orbit-two">
                <span className="orbit-particle particle-two" />
              </div>

              <div className="orbit orbit-three">
                <span className="orbit-particle particle-three" />
              </div>

              <span className="orbit-spark spark-one" />
              <span className="orbit-spark spark-two" />
              <span className="orbit-spark spark-three" />
            </div>

            <div className="dashboard-card relative rounded-2xl border p-5 shadow-2xl sm:p-7">
              <div className="flex items-center justify-between gap-3 border-b pb-5">
                <div>
                  <p className="dashboard-muted text-sm">DigitAuth</p>
                  <h2 className="mt-1 text-lg font-semibold">
                    Developer workspace
                  </h2>
                </div>

                <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Workspace
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="dashboard-panel rounded-xl border p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-500/50">
                  <p className="dashboard-muted text-sm">Integration</p>
                  <p className="mt-3 text-2xl font-semibold sm:text-3xl">
                    React
                  </p>
                  <p className="dashboard-muted mt-1 text-xs">SDK available</p>
                </div>

                <div className="dashboard-panel rounded-xl border p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-500/50">
                  <p className="dashboard-muted text-sm">Server SDK</p>
                  <p className="mt-3 text-2xl font-semibold sm:text-3xl">
                    Node.js
                  </p>
                  <p className="dashboard-muted mt-1 text-xs">
                    Server integration
                  </p>
                </div>
              </div>

              <div className="dashboard-panel mt-5 rounded-xl border p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Authentication foundation</p>
                    <p className="dashboard-muted mt-1 text-sm">
                      Core capabilities
                    </p>
                  </div>

                  <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-blue-500">
                    DigitAuth
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    "Registration and sign-in",
                    "Email verification",
                    "Password recovery",
                    "Session management",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="dashboard-muted flex items-center gap-3 text-sm"
                      style={{
                        animation: `digit-fade-up 600ms ease-out ${
                          500 + index * 180
                        }ms both`,
                      }}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-600">
                        ✓
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <p className="dashboard-muted mt-4 text-xs">
                Illustrative preview — not live account data.
              </p>
            </div>

            {/* Floating activity notifications */}
            <div className="activity-toast activity-toast-one">
              <span className="activity-icon">✓</span>
              <div>
                <p className="activity-title text-sm font-medium">
                  New user registered
                </p>
                <p className="dashboard-muted text-xs">Illustrative activity</p>
              </div>
              <span className="activity-status" />
            </div>

            <div className="activity-toast activity-toast-two">
              <span className="activity-icon">◆</span>
              <div>
                <p className="activity-title text-sm font-medium">
                  Session created
                </p>
                <p className="dashboard-muted text-xs">Illustrative activity</p>
              </div>
              <span className="activity-status" />
            </div>

            <div className="activity-toast activity-toast-three">
              <span className="activity-icon">&lt;/&gt;</span>
              <div>
                <p className="activity-title text-sm font-medium">
                  API integration
                </p>
                <p className="dashboard-muted text-xs">Illustrative activity</p>
              </div>
              <span className="activity-status" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-[var(--site-border)] px-5 py-20 sm:px-8 sm:py-24 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <SectionLabel>Why DigitAuth</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              The authentication foundation for your next application.
            </h2>
            <p className="mt-5 leading-7 text-[var(--site-muted)]">
              Spend less time wiring together authentication flows and more time
              building the features that make your product different.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="feature-card group rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <p className="text-xs font-semibold tracking-[0.15em] text-blue-400">
                  {feature.number}
                </p>
                <h3 className="mt-7 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--site-muted)]">
                  {feature.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[var(--site-border)] px-2 py-1 text-[11px] text-[var(--site-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Developer integration */}
      <section
        id="developers"
        className="border-t border-[var(--site-border)] px-5 py-20 sm:px-8 sm:py-24 lg:px-12"
      >
        <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionLabel>Developer experience</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Integrate authentication into your React app.
            </h2>
            <p className="mt-5 leading-7 text-[var(--site-muted)]">
              Install the React package, configure the provider near your
              application root, and use the authentication hook in client
              components.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--site-border)] text-sm font-semibold text-blue-400">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Install the SDK</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--site-muted)]">
                    Add the published React package to your project.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--site-border)] text-sm font-semibold text-blue-400">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Configure the provider</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--site-muted)]">
                    Supply your API URL and publishable key through your
                    environment configuration.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--site-border)] text-sm font-semibold text-blue-400">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Use authentication state</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--site-muted)]">
                    Use the SDK's authentication hook to build signed-in and
                    signed-out experiences.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/docs"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Explore the integration guide
              <ArrowIcon />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--site-border)] bg-white text-slate-800 shadow-xl transition-colors duration-300 dark:bg-[#080d18] dark:text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-500">
                React integration
              </span>
            </div>

            <div className="overflow-x-auto p-5 sm:p-6">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-7 text-slate-700 sm:text-sm dark:text-slate-300">
                <code>{reactExample}</code>
              </pre>
            </div>

            <div className="border-t border-slate-200 px-5 py-4 dark:border-white/10">
              <p className="text-xs leading-6 text-slate-600 dark:text-slate-400">
                Example overview: the provider and hook are shown together for
                clarity. See the documentation for the complete component
                imports, client-component requirements, and setup instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section
        id="security"
        className="border-t border-[var(--site-border)] px-5 py-20 sm:px-8 sm:py-24 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <SectionLabel>Security foundations</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Security is part of the authentication flow.
            </h2>
            <p className="mt-5 leading-7 text-[var(--site-muted)]">
              Understand the token model, session configuration, and API
              protections before integrating DigitAuth into a production app.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {securityItems.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[var(--site-border)] p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <CheckIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--site-muted)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
            <p className="text-sm font-semibold text-amber-300">
              Before production
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--site-muted)]">
              Configure HTTPS, protect server-side secrets, review your
              deployment environment, and verify the password-hashing
              implementation and token-expiry settings in the version you
              deploy. This page deliberately does not name a password-hashing
              algorithm or claim cookie-based authentication without verifying
              those implementation details.
            </p>
          </div>
        </div>
      </section>

      {/* Features and roadmap */}
      <section
        id="roadmap"
        className="border-t border-[var(--site-border)] px-5 py-20 sm:px-8 sm:py-24 lg:px-12"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionLabel>Available capabilities</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Built around the essentials.
            </h2>
            <p className="mt-4 leading-7 text-[var(--site-muted)]">
              These are the core capabilities currently represented in the
              DigitAuth project.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {supportedFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-6 text-[var(--site-muted)]"
                >
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionLabel>Product roadmap</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              What comes next.
            </h2>
            <p className="mt-4 leading-7 text-[var(--site-muted)]">
              These are future improvements, not features you should assume are
              available today.
            </p>

            <div className="mt-8 space-y-4">
              {roadmapFeatures.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-[var(--site-border)] p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                      {feature.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--site-muted)]">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick setup */}
      <section className="border-t border-[var(--site-border)] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionLabel>Get started</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with your application credentials.
            </h2>
            <p className="mt-5 leading-7 text-[var(--site-muted)]">
              Create a DigitAuth platform account, configure an application, and
              use its publishable key in your frontend integration.
            </p>
            <Link
              href="/platform/register"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Create your account
              <ArrowIcon />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--site-border)] bg-white transition-colors duration-300 dark:bg-[#080d18]">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Environment variables
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Example frontend configuration
              </p>
            </div>

            <div className="overflow-x-auto p-5">
              <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-7 text-slate-700 sm:text-sm dark:text-slate-300">
                <code>{environmentExample}</code>
              </pre>
            </div>

            <div className="border-t border-slate-200 px-5 py-4 dark:border-white/10">
              <p className="text-xs leading-6 text-slate-600 dark:text-slate-400">
                Replace the publishable-key placeholder with the key for your
                application. Values prefixed with NEXT_PUBLIC are exposed to the
                browser, so never put a client secret or other private
                credential in them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-blue-500/20 bg-[var(--site-surface)] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/[0.12] via-transparent to-violet-600/[0.08]"
          />

          <div className="relative mx-auto max-w-2xl">
            <SectionLabel>Build with DigitAuth</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Focus on your product. Start with authentication.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--site-muted)]">
              Explore the docs, set up your application, and integrate DigitAuth
              into your development workflow.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/platform/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Get started
                <ArrowIcon />
              </Link>
              <Link
                href="/docs"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--site-border)] px-6 py-3 text-sm font-semibold transition hover:bg-[var(--site-bg)]"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--site-border)] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex w-fit items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
              D
            </span>
            <span>
              <span className="block text-sm font-semibold">DigitAuth</span>
              <span className="mt-0.5 block text-xs text-[var(--site-muted)]">
                Authentication for developers
              </span>
            </span>
          </Link>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--site-muted)]"
          >
            <Link href="/docs" className="transition hover:text-blue-400">
              Documentation
            </Link>
            <Link
              href="/platform/login"
              className="transition hover:text-blue-400"
            >
              Platform sign in
            </Link>
            <Link
              href="/platform/register"
              className="transition hover:text-blue-400"
            >
              Create account
            </Link>
          </nav>

          <p className="text-xs text-[var(--site-muted)]">
            © {new Date().getFullYear()} DigitAuth
          </p>
        </div>
      </footer>
    </main>
  );
}
