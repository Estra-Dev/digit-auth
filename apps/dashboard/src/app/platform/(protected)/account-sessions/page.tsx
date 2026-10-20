"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  getPlatformSessions,
  revokeOtherPlatformSessions,
  revokePlatformSession,
} from "@/lib/platform-auth/platform-auth";
import type { PlatformSession } from "@/types/platform-auth";

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}

function getDeviceLabel(userAgent: string | null) {
  if (!userAgent) return "Unknown device";
  if (/tablet|ipad/i.test(userAgent)) return "Tablet";
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function getBrowserLabel(userAgent: string | null) {
  if (!userAgent) return "Unknown browser";
  if (/edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/opr\/|opera/i.test(userAgent)) return "Opera";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) {
    return "Chrome";
  }
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) {
    return "Safari";
  }
  return "Other browser";
}

export default function AccountSessionsPage() {
  const [sessions, setSessions] = useState<PlatformSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPlatformSessions();
      setSessions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your sessions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const data = await getPlatformSessions();

        if (!cancelled) {
          setSessions(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load your sessions.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRevoke(session: PlatformSession) {
    if (session.current) {
      setError(
        "This is your current session. Use Sign out if you want to end it.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Revoke this session? The device will need to sign in again.",
    );

    if (!confirmed) return;

    setBusyId(session.id);
    setError(null);
    setNotice(null);

    try {
      await revokePlatformSession(session.id);
      setSessions((current) =>
        current.filter((item) => item.id !== session.id),
      );
      setNotice("Session revoked successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to revoke the session.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleRevokeOthers() {
    const otherSessions = sessions.filter((session) => !session.current);

    if (otherSessions.length === 0) {
      setNotice("There are no other sessions to revoke.");
      return;
    }

    const confirmed = window.confirm(
      `Revoke ${otherSessions.length} other session(s)? Your current session will remain active.`,
    );

    if (!confirmed) return;

    setRevokingOthers(true);
    setError(null);
    setNotice(null);

    try {
      await revokeOtherPlatformSessions();
      setSessions((current) => current.filter((session) => session.current));
      setNotice("All other sessions have been revoked.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to revoke other sessions.",
      );
    } finally {
      setRevokingOthers(false);
    }
  }

  const currentSession = sessions.find((session) => session.current);
  const otherSessions = sessions.filter((session) => !session.current);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/platform/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Dashboard
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              Account security
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              My sessions
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              View the devices signed in to your DigitAuth developer account and
              revoke sessions you no longer recognise or use.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleRevokeOthers()}
            disabled={loading || revokingOthers || otherSessions.length === 0}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {revokingOthers ? "Revoking sessions..." : "Revoke other sessions"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300"
          >
            {notice}
          </div>
        )}

        <section className="mb-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Total sessions</p>
            <p className="mt-2 text-2xl font-semibold">
              {loading ? "—" : sessions.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Current session</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {loading ? "—" : currentSession ? "Active" : "Not identified"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Other sessions</p>
            <p className="mt-2 text-2xl font-semibold">
              {loading ? "—" : otherSessions.length}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-slate-400">
              Loading your sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <p className="font-medium">No sessions found</p>
              <p className="mt-2 text-sm text-slate-400">
                Refresh to check whether your account sessions are available.
              </p>
              <button
                type="button"
                onClick={() => void loadSessions()}
                className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {sessions.map((session) => (
                <article key={session.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-medium">
                          {getDeviceLabel(session.userAgent)} ·{" "}
                          {getBrowserLabel(session.userAgent)}
                        </h2>

                        {session.current && (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                            This device
                          </span>
                        )}
                      </div>

                      <dl className="mt-3 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-slate-500">IP address</dt>
                          <dd className="mt-1 break-all text-slate-300">
                            {session.ipAddress || "Not available"}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-slate-500">Last active</dt>
                          <dd className="mt-1 text-slate-300">
                            {formatDate(session.lastUsedAt)}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-slate-500">Signed in</dt>
                          <dd className="mt-1 text-slate-300">
                            {formatDate(session.createdAt)}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-slate-500">Session expires</dt>
                          <dd className="mt-1 text-slate-300">
                            {formatDate(session.expiresAt)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleRevoke(session)}
                      disabled={session.current || busyId === session.id}
                      className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {session.current
                        ? "Current session"
                        : busyId === session.id
                          ? "Revoking..."
                          : "Revoke session"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          If you revoke a session, that device must authenticate again. Only
          sessions associated with your DigitAuth developer account are shown
          here; your applications end-user sessions remain under Sessions.
        </p>
      </div>
    </main>
  );
}
