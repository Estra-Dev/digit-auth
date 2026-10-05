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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white lg:hidden"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {workspace.name}
          </p>

          <p className="truncate text-xs text-slate-500">Workspace</p>
        </div>
      </div>

      <div className="ml-4 min-w-0 text-right">
        <p className="max-w-45 truncate text-sm text-slate-300 sm:max-w-xs">
          {account?.email ?? "Workspace account"}
        </p>

        <p className="text-xs text-slate-500">
          {account?.status ?? "Authenticated"}
        </p>
      </div>
    </header>
  );
}
