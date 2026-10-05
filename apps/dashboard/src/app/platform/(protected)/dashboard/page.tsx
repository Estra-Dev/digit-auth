"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getPlatformAccount,
  platformLogout,
} from "@/lib/platform-auth/platform-auth";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import type { PlatformAccount } from "@/types/platform-auth";

export default function PlatformDashboardPage() {
  const router = useRouter();

  const [account, setAccount] = useState<PlatformAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const { workspace } = useWorkspace();

  useEffect(() => {
    async function loadAccount() {
      try {
        const platformAccount = await getPlatformAccount();
        setAccount(platformAccount);
      } catch {
        router.replace("/platform/login");
      } finally {
        setLoading(false);
      }
    }

    void loadAccount();
  }, [router]);

  async function handleLogout() {
    await platformLogout();
    router.replace("/platform/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">Loading workspace dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">DigitAuth</h1>

            <p className="text-sm text-slate-400">{workspace.name}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Current workspace
          </p>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {workspace.name}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Workspace ID: {workspace.id}
              </p>
            </div>

            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
              {workspace.status}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm text-slate-400">Welcome back</p>

          <h2 className="mt-1 text-3xl font-bold">Workspace Overview</h2>

          <p className="mt-2 text-sm text-slate-400">
            Manage your applications, users, sessions, and authentication
            settings from your DigitAuth workspace.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Workspace account</p>

            <p className="mt-3 truncate text-lg font-semibold">
              {account?.email}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Account status</p>

            <p className="mt-3 text-lg font-semibold">{account?.status}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Workspace status</p>

            <p className="mt-3 text-lg font-semibold">{workspace.status}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-semibold">Your DigitAuth workspace</h3>

          <p className="mt-2 text-sm text-slate-400">
            This workspace is where you can manage your DigitAuth applications
            and the users and sessions associated with them.
          </p>
        </div>
      </section>
    </main>
  );
}
