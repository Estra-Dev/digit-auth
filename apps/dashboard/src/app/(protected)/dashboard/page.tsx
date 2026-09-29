"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getPlatformAccount,
  getPlatformApplications,
} from "@/lib/platform-auth/platform-auth";
import type {
  PlatformAccount,
  PlatformApplication,
} from "@/types/platform-auth";

export default function PlatformDashboardPage() {
  const router = useRouter();

  const [account, setAccount] = useState<PlatformAccount | null>(null);
  const [applications, setApplications] = useState<PlatformApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [platformAccount, platformApplications] = await Promise.all([
          getPlatformAccount(),
          getPlatformApplications(),
        ]);

        if (!cancelled) {
          setAccount(platformAccount);
          setApplications(platformApplications);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          router.replace("/platform/login");
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">Loading platform overview...</p>
      </main>
    );
  }

  const totalApplications = applications.length;
  const activeApplications = applications.filter(
    (application) => application.status === "ACTIVE",
  ).length;
  const suspendedApplications = applications.filter(
    (application) => application.status === "SUSPENDED",
  ).length;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Welcome back</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Platform Overview
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your DigitAuth platform and applications.
            </p>
          </div>

          <Link
            href="/platform/applications"
            className="inline-flex w-fit items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Manage applications
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total applications</p>

            <p className="mt-3 text-3xl font-bold">{totalApplications}</p>

            <p className="mt-2 text-xs text-slate-500">
              Applications registered on DigitAuth
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Active applications</p>

            <p className="mt-3 text-3xl font-bold text-emerald-400">
              {activeApplications}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Currently allowed to authenticate
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Suspended applications</p>

            <p className="mt-3 text-3xl font-bold text-amber-400">
              {suspendedApplications}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Currently blocked from authentication
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Platform account</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your DigitAuth platform owner account.
                </p>
              </div>

              <span className="rounded-full border border-emerald-900/50 bg-emerald-950/30 px-3 py-1 text-xs font-medium text-emerald-400">
                {account?.status}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-slate-600">
                Email
              </p>

              <p className="mt-2 truncate text-sm text-slate-300">
                {account?.email}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Applications</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your registered DigitAuth applications.
                </p>
              </div>

              <Link
                href="/platform/applications"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                View all
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="mt-8 rounded-xl border border-dashed border-slate-800 px-5 py-8 text-center">
                <p className="text-sm text-slate-400">No applications yet.</p>

                <Link
                  href="/platform/applications"
                  className="mt-3 inline-block text-sm font-medium text-white underline underline-offset-4"
                >
                  Create your first application
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {applications.slice(0, 3).map((application) => (
                  <Link
                    key={application.id}
                    href={`/platform/applications/${application.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 transition hover:border-slate-700 hover:bg-slate-900"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {application.name}
                      </p>

                      <p className="mt-1 truncate font-mono text-xs text-slate-600">
                        {application.clientId}
                      </p>
                    </div>

                    <span
                      className={
                        application.status === "ACTIVE"
                          ? "ml-4 shrink-0 text-xs font-medium text-emerald-400"
                          : "ml-4 shrink-0 text-xs font-medium text-amber-400"
                      }
                    >
                      {application.status}
                    </span>
                  </Link>
                ))}

                {applications.length > 3 && (
                  <Link
                    href="/platform/applications"
                    className="block pt-2 text-center text-sm text-slate-500 transition hover:text-white"
                  >
                    View all {applications.length} applications →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
