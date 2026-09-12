"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth, type AuthSession } from "@digit-auth/react";

import { ApiError } from "@digit-auth/react";

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getBrowserName(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown browser";
  }

  if (userAgent.includes("Edg/")) {
    return "Microsoft Edge";
  }

  if (userAgent.includes("Chrome/")) {
    return "Google Chrome";
  }

  if (userAgent.includes("Firefox/")) {
    return "Mozilla Firefox";
  }

  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    return "Safari";
  }

  if (userAgent.includes("OPR/")) {
    return "Opera";
  }

  return "Unknown browser";
}

function getDeviceName(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown device";
  }

  if (/iPhone/i.test(userAgent)) {
    return "iPhone";
  }

  if (/iPad/i.test(userAgent)) {
    return "iPad";
  }

  if (/Android/i.test(userAgent)) {
    return "Android device";
  }

  if (/Windows/i.test(userAgent)) {
    return "Windows device";
  }

  if (/Macintosh|Mac OS X/i.test(userAgent)) {
    return "Mac device";
  }

  if (/Linux/i.test(userAgent)) {
    return "Linux device";
  }

  return "Unknown device";
}

function isSessionExpired(session: AuthSession) {
  return new Date(session.expiresAt).getTime() <= Date.now();
}

export default function SessionsPage() {
  const { getSessions, revokeSession, revokeOtherSessions } = useAuth();

  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionData = await getSessions();

      setSessions(sessionData);
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to load your sessions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [getSessions]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSessions();
  }, [loadSessions]);

  async function handleRevokeSession(sessionId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this session?",
    );

    if (!confirmed) {
      return;
    }

    setLoadingSessionId(sessionId);
    setError(null);
    setSuccess(null);

    try {
      await revokeSession(sessionId);

      setSessions((currentSessions) =>
        currentSessions.filter((session) => session.id !== sessionId),
      );

      setSuccess("Session revoked successfully.");
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to revoke this session.",
      );
    } finally {
      setLoadingSessionId(null);
    }
  }

  async function handleRevokeOthers() {
    const confirmed = window.confirm(
      "This will sign out every other active session while keeping your current session active. Continue?",
    );

    if (!confirmed) {
      return;
    }

    setIsRevokingOthers(true);
    setError(null);
    setSuccess(null);

    try {
      await revokeOtherSessions();

      await loadSessions();

      setSuccess("All other sessions have been revoked.");
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to revoke other sessions.",
      );
    } finally {
      setIsRevokingOthers(false);
    }
  }

  const activeSessions = sessions.filter(
    (session) => !isSessionExpired(session),
  );

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Sessions
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage the devices and browsers currently signed in to your account.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        <div className="mt-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Active sessions
              </h2>

              <p className="text-sm text-zinc-500">
                {activeSessions.length} active{" "}
                {activeSessions.length === 1 ? "session" : "sessions"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadSessions()}
              disabled={isLoading}
              className="self-start rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="h-5 w-40 animate-pulse rounded bg-zinc-100" />
                  <div className="h-4 w-64 animate-pulse rounded bg-zinc-100" />
                  <div className="h-4 w-48 animate-pulse rounded bg-zinc-100" />
                </div>
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900">
                  No active sessions
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Your active sessions will appear here after you sign in.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSessions.map((session) => {
                  const browser = getBrowserName(session.userAgent);

                  const device = getDeviceName(session.userAgent);

                  const isRevoking = loadingSessionId === session.id;

                  return (
                    <article
                      key={session.id}
                      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-5 w-5"
                              aria-hidden="true"
                            >
                              <rect width="14" height="18" x="5" y="3" rx="2" />
                              <path d="M9 7h6" />
                              <path d="M9 17h6" />
                            </svg>
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium text-zinc-900">
                                {browser}
                              </h3>

                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                Active
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-zinc-500">
                              {device}
                            </p>

                            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                  IP address
                                </dt>

                                <dd className="mt-1 text-zinc-700">
                                  {session.ipAddress ?? "Not available"}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                  Last active
                                </dt>

                                <dd className="mt-1 text-zinc-700">
                                  {formatDate(session.lastUsedAt)}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                  Signed in
                                </dt>

                                <dd className="mt-1 text-zinc-700">
                                  {formatDate(session.createdAt)}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                  Expires
                                </dt>

                                <dd className="mt-1 text-zinc-700">
                                  {formatDate(session.expiresAt)}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleRevokeSession(session.id)}
                          disabled={isRevoking || isRevokingOthers}
                          className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRevoking ? "Revoking..." : "Revoke"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Sign out other sessions
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
              If you think your account is signed in on another device, revoke
              all other sessions. Your current session will remain active.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleRevokeOthers()}
            disabled={isRevokingOthers || isLoading}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRevokingOthers
              ? "Revoking other sessions..."
              : "Revoke other sessions"}
          </button>
        </div>
      </div>
    </section>
  );
}
