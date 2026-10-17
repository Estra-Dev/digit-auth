"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getPlatformAccount } from "@/lib/platform-auth/platform-auth";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import type { PlatformAccount } from "@/types/platform-auth";

const shortcuts = [
  {
    title: "Applications",
    description: "Manage your applications and their configuration.",
    href: "/platform/applications",
    label: "View applications",
    icon: (
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5zM8 7h8M8 11h8M8 15h5" />
    ),
  },
  {
    title: "Users",
    description: "Review end users connected to your applications.",
    href: "/platform/users",
    label: "Manage users",
    icon: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
  {
    title: "Sessions",
    description: "Inspect authentication sessions for your workspace.",
    href: "/platform/sessions",
    label: "View sessions",
    icon: <path d="M12 8v4l3 2M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />,
  },
];

export default function PlatformDashboardPage() {
  const router = useRouter();

  const [account, setAccount] = useState<PlatformAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const { workspace } = useWorkspace();

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        const platformAccount = await getPlatformAccount();

        if (!cancelled) {
          setAccount(platformAccount);
        }
      } catch {
        if (!cancelled) {
          router.replace("/platform/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="flex items-center gap-3 text-sm text-[var(--site-muted)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          Loading workspace dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-w-0 overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/[0.07] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-500">
            Developer workspace
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--site-text)] sm:text-3xl">
            Workspace overview
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--site-muted)] sm:text-base">
            Manage your applications, monitor authentication activity, and
            access the tools connected to your DigitAuth workspace.
          </p>
        </div>

        <section
          aria-labelledby="workspace-heading"
          className="mb-8 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-muted)]">
                Current workspace
              </p>

              <h2
                id="workspace-heading"
                className="mt-3 truncate text-xl font-semibold text-[var(--site-text)]"
              >
                {workspace.name}
              </h2>

              <p className="mt-2 break-all text-xs text-[var(--site-muted)]">
                Workspace ID: {workspace.id}
              </p>
            </div>

            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[var(--site-border)] bg-[var(--site-bg)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--site-text)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {workspace.status}
            </span>
          </div>
        </section>

        <section aria-labelledby="account-heading" className="mb-10">
          <div className="mb-4">
            <h2
              id="account-heading"
              className="text-base font-semibold text-[var(--site-text)]"
            >
              Account details
            </h2>

            <p className="mt-1 text-sm text-[var(--site-muted)]">
              Your platform account and workspace status.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="min-w-0 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>

                <div className="min-w-0">
                  <p className="text-sm text-[var(--site-muted)]">
                    Platform account
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-[var(--site-text)]">
                    {account?.email ?? "Account unavailable"}
                  </p>
                </div>
              </div>
            </article>

            <article className="min-w-0 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="m9 12 2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </span>

                <div>
                  <p className="text-sm text-[var(--site-muted)]">
                    Account status
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize text-[var(--site-text)]">
                    {account?.status ?? "Unavailable"}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section aria-labelledby="tools-heading">
          <div className="mb-4">
            <h2
              id="tools-heading"
              className="text-base font-semibold text-[var(--site-text)]"
            >
              Workspace tools
            </h2>

            <p className="mt-1 text-sm text-[var(--site-muted)]">
              Jump directly to the resources you want to manage.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shortcuts.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-blue-500/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-500 transition group-hover:bg-blue-500/15">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </svg>
                </div>

                <h3 className="mt-5 text-base font-semibold text-[var(--site-text)]">
                  {item.title}
                </h3>

                <p className="mt-2 min-h-10 text-sm leading-5 text-[var(--site-muted)]">
                  {item.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-500">
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
