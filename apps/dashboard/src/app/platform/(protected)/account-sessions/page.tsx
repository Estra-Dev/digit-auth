"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getPlatformSessions,
  revokeOtherPlatformSessions,
  revokePlatformSession,
} from "@/lib/platform-auth/platform-auth";
import type { PlatformSession } from "@/types/platform-auth";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getBrowserName(userAgent: string | null) {
  if (!userAgent) return "Unknown browser";
  if (userAgent.includes("Edg/")) return "Microsoft Edge";
  if (userAgent.includes("OPR/")) return "Opera";
  if (userAgent.includes("Firefox/")) return "Mozilla Firefox";
  if (userAgent.includes("Chrome/")) return "Google Chrome";
  if (userAgent.includes("Safari/")) return "Safari";
  return "Unknown browser";
}

function getDeviceName(userAgent: string | null) {
  if (!userAgent) return "Unknown device";
  if (/iPhone/i.test(userAgent)) return "iPhone";
  if (/iPad/i.test(userAgent)) return "iPad";
  if (/Android/i.test(userAgent)) return "Android device";
  if (/Windows/i.test(userAgent)) return "Windows device";
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "Mac device";
  if (/Linux/i.test(userAgent)) return "Linux device";
  return "Unknown device";
}

function isExpired(session: PlatformSession) {
  return new Date(session.expiresAt).getTime() <= Date.now();
}

export default function PlatformAccountSessionsPage() {
  const [sessions, setSessions] = useState<PlatformSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionSessionId, setActionSessionId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadSessions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const data = await getPlatformSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your sessions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const activeSessions = useMemo(
    () => sessions.filter((session) => !isExpired(session)),
    [sessions],
  );

  const expiredSessions = sessions.length - activeSessions.length;

  async function handleRevoke(session: PlatformSession) {
    if (session.current) return;

    const confirmed = window.confirm(
      "Sign out this device? Its current session will be revoked.",
    );

    if (!confirmed) return;

    setActionSessionId(session.id);
    setError(null);
    setNotice(null);

    try {
      await revokePlatformSession(session.id);
      setSessions((current) => current.filter((item) => item.id !== session.id));
      setNotice("Session revoked successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to revoke this session.");
    } finally {
      setActionSessionId(null);
    }
  }

  async function handleRevokeOthers() {
    const otherSessions = sessions.filter((session) => !session.current);

    if (otherSessions.length === 0) return;

    const confirmed = window.confirm(
      "Sign out all other devices and browsers? Your current session will remain active.",
    );

    if (!confirmed) return;

    setRevokingOthers(true);
    setError(null);
    setNotice(null);

    try {
      await revokeOtherPlatformSessions();
      setSessions((current) => current.filter((session) => session.current));
      setNotice("All other platform sessions have been revoked.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to revoke other sessions.");
    } finally {
      setRevokingOthers(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">Platform account</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              My sessions
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Review the browsers and devices signed in to your DigitAuth developer account.
              These are separate from end-user sessions across your applications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadSessions(true)}
            disabled={loading || refreshing}
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {notice && (
          <div role="status" className="mt-6 rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
            {notice}
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total sessions" value={loading ? "—" : sessions.length} />
          <StatCard label="Active sessions" value={loading ? "—" : activeSessions.length} />
          <StatCard label="Expired sessions" value={loading ? "—" : expiredSessions} />
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Signed-in devices</h2>
              <p className="mt-1 text-sm text-slate-400">
                Your current browser is marked so you can identify it easily.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleRevokeOthers()}
              disabled={loading || revokingOthers || sessions.filter((session) => !session.current).length === 0}
              className="rounded-lg border border-red-900/70 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {revokingOthers ? "Signing out other devices..." : "Sign out other devices"}
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
                Loading platform sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                <h3 className="text-sm font-semibold">No platform sessions found</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Sign in to your developer account again, then refresh this page.
                </p>
              </div>
            ) : (
              sessions.map((session) => {
                const expired = isExpired(session);
                const revoking = actionSessionId === session.id;

                return (
                  <article key={session.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-300" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                            <rect x="3" y="4" width="18" height="13" rx="2" />
                            <path d="M8 21h8M12 17v4" />
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-white">{getBrowserName(session.userAgent)}</h3>
                            {session.current && (
                              <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                                This device
                              </span>
                            )}
                            <span className={expired
                              ? "rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300"
                              : "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300"}>
                              {expired ? "Expired" : "Active"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-400">{getDeviceName(session.userAgent)}</p>

                          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                            <Detail label="IP address" value={session.ipAddress ?? "Not available"} />
                            <Detail label="Last active" value={formatDate(session.lastUsedAt)} />
                            <Detail label="Signed in" value={formatDate(session.createdAt)} />
                            <Detail label="Expires" value={formatDate(session.expiresAt)} />
                          </dl>
                        </div>
                      </div>

                      {!session.current && (
                        <button
                          type="button"
                          onClick={() => void handleRevoke(session)}
                          disabled={revoking || revokingOthers}
                          className="shrink-0 rounded-lg border border-red-900/70 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {revoking ? "Revoking..." : "Revoke"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-slate-300">{value}</dd>
    </div>
  );
}
