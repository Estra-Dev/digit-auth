import Link from "next/link";
import SiteHeader from "@/components/site-header";

const features = [
  {
    number: "01",
    title: "Secure authentication",
    description:
      "Give your applications a reliable authentication foundation with secure login, registration, and session management.",
  },
  {
    number: "02",
    title: "One developer platform",
    description:
      "Manage your applications and their authentication configuration from one central dashboard.",
  },
  {
    number: "03",
    title: "Developer-first SDK",
    description:
      "Integrate DigitAuth into your applications using a reusable React SDK and a straightforward API.",
  },
];

export default function HomePage() {
  return (
    <main className="site-home min-h-screen overflow-hidden">
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <div className="hero-glow pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:py-28 lg:grid-cols-2 lg:px-10">
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

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/platform/register"
                className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-500"
              >
                Create your account <span aria-hidden="true">→</span>
              </Link>

              <a
                href="#developers"
                className="secondary-button rounded-xl border px-6 py-3.5 text-sm font-semibold transition duration-300 hover:-translate-y-1"
              >
                Explore the platform
              </a>
            </div>

            <p className="hero-muted mt-6 text-sm">
              Built for developers. Designed to scale.
            </p>
          </div>

          {/* Animated dashboard */}
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
              <div className="flex items-center justify-between border-b pb-5">
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

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="dashboard-panel rounded-xl border p-4 transition duration-300 hover:border-blue-500/50">
                  <p className="dashboard-muted text-sm">Applications</p>
                  <p className="mt-3 text-3xl font-semibold">01</p>
                  <p className="dashboard-muted mt-1 text-xs">
                    Manage your projects
                  </p>
                </div>

                <div className="dashboard-panel rounded-xl border p-4 transition duration-300 hover:border-blue-500/50">
                  <p className="dashboard-muted text-sm">Authentication</p>
                  <p className="mt-3 text-lg font-semibold text-cyan-500">
                    Ready to integrate
                  </p>
                  <p className="dashboard-muted mt-2 text-xs">SDK and API</p>
                </div>
              </div>

              <div className="dashboard-panel mt-5 rounded-xl border p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Your application</p>
                    <p className="dashboard-muted mt-1 text-sm">
                      Authentication configuration
                    </p>
                  </div>

                  <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-blue-500">
                    API ready
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    "Email and password authentication",
                    "Session management",
                    "User profile integration",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="dashboard-muted flex items-center gap-3 text-sm"
                      style={{
                        animation: `digit-fade-up 600ms ease-out ${500 + index * 180}ms both`,
                      }}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-600">
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

            {/* Illustrative floating activities */}
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
      <section id="features" className="features-section border-t">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="motion-hero max-w-2xl">
            <p className="section-eyebrow text-sm font-semibold uppercase tracking-[0.2em]">
              The foundation
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Authentication without the unnecessary complexity.
            </h2>

            <p className="section-description mt-5 leading-7">
              A central platform for managing your projects and reusable
              authentication capabilities.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.number}
                className="feature-card rounded-2xl border p-7"
                style={{ animationDelay: `${index * 140}ms` }}
              >
                <span className="section-eyebrow text-sm font-semibold">
                  {feature.number}
                </span>

                <h3 className="mt-7 text-xl font-semibold">{feature.title}</h3>

                <p className="section-description mt-4 text-sm leading-7">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Developer CTA */}
      <section
        id="developers"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
      >
        <div className="developer-cta relative overflow-hidden rounded-3xl border p-8 sm:p-12">
          <div className="cta-glow pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full blur-3xl" />

          <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="section-eyebrow text-sm font-semibold uppercase tracking-[0.2em]">
                For builders
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Focus on the product. Let DigitAuth handle the foundation.
              </h2>

              <p className="section-description mt-5 leading-7">
                Create a platform account, manage your applications, and
                integrate authentication into your own projects.
              </p>
            </div>

            <Link
              href="/platform/register"
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-blue-500"
            >
              Get started <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <Link href="/" className="font-semibold">
            DigitAuth
          </Link>

          <p className="section-description">
            Authentication infrastructure for your applications.
          </p>

          <div className="flex flex-wrap gap-5">
            <Link
              href="/platform/login"
              className="site-nav-link transition hover:text-blue-500"
            >
              Platform login
            </Link>

            <Link
              href="/platform/register"
              className="site-nav-link transition hover:text-blue-500"
            >
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
