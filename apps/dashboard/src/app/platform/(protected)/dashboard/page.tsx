"use client";

import { useEffect, useState } from "react";
import {
  getPlatformAccount,
  platformLogout,
} from "@/lib/platform-auth/platform-auth";
import type { PlatformAccount } from "@/types/platform-auth";
import { useRouter } from "next/navigation";

export default function PlatformDashboardPage() {
  const router = useRouter();

  const [account, setAccount] = useState<PlatformAccount | null>(null);
  const [loading, setLoading] = useState(true);

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
        <p className="text-sm text-slate-400">Loading platform dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">DigitAuth</h1>

            <p className="text-sm text-slate-400">Platform Dashboard</p>
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
        <div className="mb-8">
          <p className="text-sm text-slate-400">Welcome back</p>

          <h2 className="mt-1 text-3xl font-bold">Platform Overview</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Platform account</p>

            <p className="mt-3 truncate text-lg font-semibold">
              {account?.email}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Account status</p>

            <p className="mt-3 text-lg font-semibold">{account?.status}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Applications</p>

            <p className="mt-3 text-lg font-semibold">Coming next</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-semibold">Platform account</h3>

          <p className="mt-2 text-sm text-slate-400">
            You are authenticated as the DigitAuth platform owner.
          </p>
        </div>
      </section>
    </main>
  );
}
