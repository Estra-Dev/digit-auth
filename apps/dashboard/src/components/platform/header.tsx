"use client";

import { useEffect, useState } from "react";

import { getPlatformAccount } from "@/lib/platform-auth/platform-auth";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import type { PlatformAccount } from "@/types/platform-auth";

type PlatformHeaderProps = {
  onMenuClick: () => void;
};

export default function PlatformHeader({ onMenuClick }: PlatformHeaderProps) {
  const [account, setAccount] = useState<PlatformAccount | null>(null);
  const { workspace } = useWorkspace();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getPlatformAccount();

        if (!cancelled) {
          setAccount(data);
        }
      } catch {
        // Protected layout handles authentication failures.
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const accountInitial = account?.email?.charAt(0).toUpperCase() ?? "D";

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[var(--site-border)] bg-[var(--site-bg)]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="rounded-xl border border-[var(--site-border)] p-2 text-[var(--site-muted)] transition hover:bg-blue-500/10 hover:text-[var(--site-text)] lg:hidden"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--site-muted)]">
            Developer console
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-[var(--site-text)] sm:text-base">
            {workspace.name}
          </p>
        </div>
      </div>

      <div className="ml-3 flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="max-w-56 truncate text-sm font-medium text-[var(--site-text)]">
            {account?.email ?? "Workspace account"}
          </p>

          <p className="mt-0.5 text-xs text-[var(--site-muted)]">
            {account?.status ?? "Loading account…"}
          </p>
        </div>

        <div
          aria-label={`Account ${account?.email ?? "loading"}`}
          title={account?.email ?? "Workspace account"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-sm font-semibold text-blue-500"
        >
          {accountInitial}
        </div>
      </div>
    </header>
  );
}
