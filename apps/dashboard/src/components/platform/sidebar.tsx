"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { platformLogout } from "@/lib/platform-auth/platform-auth";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import DigitAuthLogo from "@/components/digit-auth-logo";

const navigation = [
  {
    name: "Overview",
    href: "/platform/dashboard",
    icon: <path d="M3 3h7v7H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 14h7v7H3z" />,
  },
  {
    name: "Applications",
    href: "/platform/applications",
    icon: (
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5zM8 8h8M8 12h8M8 16h5" />
    ),
  },
  {
    name: "Users",
    href: "/platform/users",
    icon: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
  {
    name: "Sessions",
    href: "/platform/sessions",
    icon: <path d="M12 8v4l3 2M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />,
  },
  {
    name: "Getting started",
    href: "/platform/guide",
    icon: (
      <path d="M12 18h.01M9.09 9a3 3 0 1 1 5.82 1c-.9.6-2.91 1.3-2.91 3M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
    ),
  },
];

type PlatformSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export default function PlatformSidebar({
  mobileOpen,
  onClose,
}: PlatformSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { workspace } = useWorkspace();

  async function handleLogout() {
    await platformLogout();
    router.replace("/platform/login");
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col",
          "border-r border-[var(--site-border)] bg-[var(--site-surface)]",
          "transition-transform duration-200 ease-in-out",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--site-border)] px-5">
          <Link
            href="/platform/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10 shadow-sm shadow-blue-950/20">
              <DigitAuthLogo className="h-7 w-7" />
            </span>

            <span className="min-w-0">
              <span className="block text-base font-semibold tracking-tight text-[var(--site-text)]">
                DigitAuth
              </span>
              <span className="mt-0.5 block truncate text-xs text-[var(--site-muted)]">
                Developer platform
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--site-muted)] transition hover:bg-blue-500/10 hover:text-[var(--site-text)] lg:hidden"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-4 pb-2 pt-6">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--site-muted)]">
            Workspace
          </p>
        </div>

        <nav
          aria-label="Platform navigation"
          className="flex-1 space-y-1 overflow-y-auto px-3 pb-4"
        >
          {navigation.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={[
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-150",
                  active
                    ? "bg-blue-500/10 font-medium text-blue-500 ring-1 ring-inset ring-blue-400/15"
                    : "text-[var(--site-muted)] hover:bg-blue-500/5 hover:text-[var(--site-text)]",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-blue-400" />
                )}

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-[18px] w-[18px] shrink-0"
                >
                  {item.icon}
                </svg>

                <span>{item.name}</span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[var(--site-border)] p-4">
          <div className="mb-3 rounded-xl border border-[var(--site-border)] bg-[var(--site-bg)] p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              <p className="text-xs font-medium text-[var(--site-text)]">
                Current workspace
              </p>
            </div>

            <p className="mt-2 truncate text-sm font-medium text-[var(--site-text)]">
              {workspace.name}
            </p>

            <p className="mt-1 text-xs capitalize text-[var(--site-muted)]">
              {workspace.status}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--site-muted)] transition hover:bg-red-500/10 hover:text-red-400"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-[18px] w-[18px]"
            >
              <path d="M10 17l5-5-5-5M15 12H3" />
              <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
