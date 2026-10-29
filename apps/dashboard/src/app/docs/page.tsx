import Link from "next/link";
import SiteHeader from "@/components/site-header";

const sections = [
  {
    id: "overview",
    number: "01",
    title: "What is DigitAuth?",
    description:
      "DigitAuth is an authentication platform for developers. Integrate reusable authentication capabilities into your applications and manage application configuration from a central dashboard.",
  },
  {
    id: "installation",
    number: "02",
    title: "Install the React SDK",
    description:
      "Install the published React SDK in your application using your preferred package manager.",
    code: "pnpm add @digit-auth/react",
  },
  {
    id: "provider",
    number: "03",
    title: "Configure the provider",
    description:
      "Wrap your application with AuthProvider and provide the API URL and publishable key for your DigitAuth application.",
    code: `import { AuthProvider } from "@digit-auth/react";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider
      apiUrl={process.env.NEXT_PUBLIC_DIGIT_AUTH_API_URL!}
      publishableKey={
        process.env.NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY!
      }
    >
      {children}
    </AuthProvider>
  );
}`,
  },
  {
    id: "authentication",
    number: "04",
    title: "Use authentication in your UI",
    description:
      "Use the SDK's authentication hooks and components to connect your interface to DigitAuth. Confirm the exact API and return fields against the installed SDK version.",
    code: `import { useAuth } from "@digit-auth/react";

export function AccountStatus() {
  const { isSignedIn, user } = useAuth();

  if (!isSignedIn) {
    return <p>Sign in to continue.</p>;
  }

  return <p>Signed in as {user?.email}</p>;
}`,
  },
  {
    id: "webhooks",
    number: "05",
    title: "React to authentication events",
    description:
      "DigitAuth supports the user.created and user.email_verified webhook events. Configure an endpoint in your platform dashboard, verify webhook signatures on your server, and handle repeated deliveries safely.",
  },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950 p-4 text-xs leading-6 text-blue-100 sm:text-sm">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <main className="site-home min-h-screen">
      <SiteHeader />

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-10">
        <aside className="h-fit rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5 lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
            Documentation
          </p>

          <nav aria-label="Documentation sections" className="mt-4 space-y-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-lg px-3 py-2 text-sm text-[var(--site-muted)] transition hover:bg-blue-500/10 hover:text-[var(--site-text)]"
              >
                {section.title}
              </a>
            ))}
          </nav>

          <div className="mt-5 border-t border-[var(--site-border)] pt-5">
            <Link
              href="/platform/register"
              className="text-sm font-medium text-blue-500 hover:text-cyan-500"
            >
              Create an account →
            </Link>
          </div>
        </aside>

        <article className="min-w-0">
          <header className="border-b border-[var(--site-border)] pb-8">
            <p className="text-sm font-semibold text-blue-500">
              DigitAuth Developers
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--site-text)] sm:text-5xl">
              Documentation
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--site-muted)]">
              Learn the integration basics, connect the React SDK, and handle
              authentication events in your application.
            </p>

            <p className="mt-3 text-xs leading-5 text-[var(--site-muted)]">
              Public documentation — no account required to read this page.
            </p>
          </header>

          <div className="divide-y divide-[var(--site-border)]">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28 py-9"
              >
                <div className="flex gap-4">
                  <span className="pt-1 text-xs font-semibold text-blue-500">
                    {section.number}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-semibold text-[var(--site-text)]">
                      {section.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-[var(--site-muted)]">
                      {section.description}
                    </p>

                    {"code" in section && section.code && (
                      <div className="mt-5">
                        <CodeBlock>{section.code}</CodeBlock>
                      </div>
                    )}

                    {section.id === "provider" && (
                      <div className="mt-5 rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
                        <h3 className="text-sm font-semibold text-[var(--site-text)]">
                          Environment variables
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
                          Configure these variables in your Next.js
                          application's environment settings.
                        </p>

                        <div className="mt-3">
                          <CodeBlock>{`NEXT_PUBLIC_DIGIT_AUTH_API_URL=https://digit-auth.onrender.com/api/v1
NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY=your_publishable_key`}</CodeBlock>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-[var(--site-muted)]">
                          Use your application's actual publishable key. Never
                          expose your client secret in browser-side code.
                        </p>
                      </div>
                    )}

                    {section.id === "authentication" && (
                      <div className="mt-5 rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
                        <h3 className="text-sm font-semibold text-[var(--site-text)]">
                          Authentication options
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
                          Check the installed SDK's exported types and
                          documentation to confirm the available hooks,
                          components, and return fields before using this
                          example in production.
                        </p>
                      </div>
                    )}

                    {section.id === "webhooks" && (
                      <div className="mt-5 rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
                        <h3 className="text-sm font-semibold text-[var(--site-text)]">
                          Webhook integration checklist
                        </h3>

                        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--site-muted)]">
                          <li>
                            1. Configure your webhook endpoint in the dashboard.
                          </li>
                          <li>
                            2. Verify webhook signatures on your server using
                            the supported verification method.
                          </li>
                          <li>3. Handle duplicate event deliveries safely.</li>
                          <li>
                            4. Return an appropriate HTTP response after
                            processing the event.
                          </li>
                        </ul>

                        <p className="mt-3 text-xs leading-5 text-[var(--site-muted)]">
                          Confirm the webhook signature format and verification
                          API in your current DigitAuth implementation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-8 rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-6">
            <h2 className="text-xl font-semibold text-[var(--site-text)]">
              Ready to integrate?
            </h2>

            <p className="mt-2 text-sm leading-7 text-[var(--site-muted)]">
              Create a DigitAuth account to configure your application and
              manage its authentication settings.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/platform/register"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Create account
              </Link>

              <Link
                href="/platform/login"
                className="rounded-lg border border-[var(--site-border)] px-4 py-2.5 text-sm font-medium text-[var(--site-text)] transition hover:bg-blue-500/10"
              >
                Sign in
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}
