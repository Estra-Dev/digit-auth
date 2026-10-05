"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getPlatformApplicationSessions } from "@/lib/platform-auth/platform-auth";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import type { PlatformApplicationSession } from "@/types/platform-auth";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function isExpired(value: string) {
  return new Date(value).getTime() <= Date.now();
}

function getUserName(session: PlatformApplicationSession) {
  const name = `${session.user.firstName} ${session.user.lastName}`.trim();

  return name || session.user.email;
}

function getDeviceLabel(userAgent: string | null) {
  if (!userAgent) return "Unknown device";

  if (/mobile/i.test(userAgent)) return "Mobile";
  if (/tablet/i.test(userAgent)) return "Tablet";

  return "Desktop";
}

export default function PlatformSessionsPage() {
  const { workspace } = useWorkspace();

  const [sessions, setSessions] = useState<PlatformApplicationSession[]>([]);
  const [search, setSearch] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      try {
        setLoading(true);
        setError(null);

        const data = await getPlatformApplicationSessions();

        if (!cancelled) {
          setSessions(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load sessions.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  const applications = useMemo(() => {
    const map = new Map<string, string>();

    for (const session of sessions) {
      map.set(session.application.id, session.application.name);
    }

    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesSearch =
        !normalizedSearch ||
        getUserName(session).toLowerCase().includes(normalizedSearch) ||
        session.user.email.toLowerCase().includes(normalizedSearch) ||
        session.application.name.toLowerCase().includes(normalizedSearch) ||
        session.application.clientId.toLowerCase().includes(normalizedSearch) ||
        (session.ipAddress ?? "").toLowerCase().includes(normalizedSearch);

      const matchesApplication =
        applicationFilter === "ALL" ||
        session.application.id === applicationFilter;

      const expired = isExpired(session.expiresAt);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && !expired) ||
        (statusFilter === "EXPIRED" && expired);

      return matchesSearch && matchesApplication && matchesStatus;
    });
  }, [sessions, search, applicationFilter, statusFilter]);

  const totalSessions = sessions.length;

  const expiredSessions = sessions.filter((session) =>
    isExpired(session.expiresAt),
  ).length;

  const activeSessions = totalSessions - expiredSessions;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            href="/platform/dashboard"
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <span>←</span>
            Dashboard
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">
                {workspace.name}
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                Sessions
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Monitor authenticated sessions across all applications in your
                DigitAuth workspace.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Total sessions</p>

            <p className="mt-2 text-2xl font-semibold text-white">
              {loading ? "—" : totalSessions}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Active sessions</p>

            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {loading ? "—" : activeSessions}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Expired sessions</p>

            <p className="mt-2 text-2xl font-semibold text-amber-400">
              {loading ? "—" : expiredSessions}
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search user, email, application or IP..."
              className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-slate-500"
            />

            <select
              value={applicationFilter}
              onChange={(event) => setApplicationFilter(event.target.value)}
              className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-slate-500"
            >
              <option value="ALL">All applications</option>

              {applications.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-slate-500"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-sm text-slate-400">
                Loading workspace sessions...
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 text-center">
              <div>
                <p className="text-sm font-medium text-white">
                  No sessions found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-250">
                  <thead>
                    <tr className="border-b border-slate-800 text-left">
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        User
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Application
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Device
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        IP
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Last used
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {filteredSessions.map((session) => {
                      const expired = isExpired(session.expiresAt);

                      return (
                        <tr
                          key={session.id}
                          className="transition hover:bg-slate-900"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {getUserName(session)}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {session.user.email}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-200">
                              {session.application.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {session.application.clientId}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-300">
                              {getDeviceLabel(session.userAgent)}
                            </p>

                            <p className="mt-1 max-w-45 truncate text-xs text-slate-500">
                              {session.userAgent ?? "Unknown"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {session.ipAddress ?? "Unknown"}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-300">
                              {formatDate(session.lastUsedAt)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Expires {formatDate(session.expiresAt)}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={
                                expired
                                  ? "inline-flex rounded-full bg-amber-950/50 px-2.5 py-1 text-xs font-medium text-amber-300"
                                  : "inline-flex rounded-full bg-emerald-950/50 px-2.5 py-1 text-xs font-medium text-emerald-300"
                              }
                            >
                              {expired ? "Expired" : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-800 lg:hidden">
                {filteredSessions.map((session) => {
                  const expired = isExpired(session.expiresAt);

                  return (
                    <div key={session.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {getUserName(session)}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {session.user.email}
                          </p>
                        </div>

                        <span
                          className={
                            expired
                              ? "shrink-0 rounded-full bg-amber-950/50 px-2.5 py-1 text-xs font-medium text-amber-300"
                              : "shrink-0 rounded-full bg-emerald-950/50 px-2.5 py-1 text-xs font-medium text-emerald-300"
                          }
                        >
                          {expired ? "Expired" : "Active"}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-slate-500">Application</p>
                          <p className="mt-1 text-slate-300">
                            {session.application.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">Device</p>
                          <p className="mt-1 text-slate-300">
                            {getDeviceLabel(session.userAgent)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">IP address</p>
                          <p className="mt-1 text-slate-300">
                            {session.ipAddress ?? "Unknown"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">Last used</p>
                          <p className="mt-1 text-slate-300">
                            {formatDate(session.lastUsedAt)}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-xs text-slate-500">Expires</p>
                          <p className="mt-1 text-slate-300">
                            {formatDate(session.expiresAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {!loading && filteredSessions.length > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Showing {filteredSessions.length} of {sessions.length} workspace
            sessions.
          </p>
        )}
      </div>
    </main>
  );
}
