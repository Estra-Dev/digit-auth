"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getPlatformUsers } from "@/lib/platform-auth/platform-auth";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import type { PlatformUser } from "@/types/platform-auth";

export default function PlatformUsersPage() {
  const router = useRouter();
  const { workspace } = useWorkspace();

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setError("");

        const data = await getPlatformUsers();

        if (!cancelled) {
          setUsers(data);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load users.",
          );
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const applications = useMemo(() => {
    const map = new Map<string, string>();

    for (const user of users) {
      if (user.application) {
        map.set(user.application.id, user.application.name);
      }
    }

    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.application?.name.toLowerCase().includes(normalizedSearch);

      const matchesApplication =
        applicationFilter === "ALL" ||
        user.application?.id === applicationFilter;

      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesApplication && matchesStatus;
    });
  }, [users, search, applicationFilter, statusFilter]);

  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;

  const verifiedUsers = users.filter((user) => user.emailVerified).length;

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Loading workspace users...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-slate-400">{workspace.name}</p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Users
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              View users across all applications in your DigitAuth workspace.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total users"
            value={users.length}
            description="Across all workspace applications"
          />

          <StatCard
            label="Active users"
            value={activeUsers}
            description="Currently active accounts"
          />

          <StatCard
            label="Verified users"
            value={verifiedUsers}
            description="Email addresses verified"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-xs text-red-500 transition hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <div>
              <label
                htmlFor="user-search"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Search
              </label>

              <input
                id="user-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email or application..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500 focus:ring-2 focus:ring-slate-700"
              />
            </div>

            <div>
              <label
                htmlFor="application-filter"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Application
              </label>

              <select
                id="application-filter"
                value={applicationFilter}
                onChange={(event) => setApplicationFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-500"
              >
                <option value="ALL">All applications</option>

                {applications.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-500"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DEACTIVATED">Deactivated</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="text-slate-300">{filteredUsers.length}</span> of{" "}
              <span className="text-slate-300">{users.length}</span> users
            </p>

            {(search ||
              applicationFilter !== "ALL" ||
              statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setApplicationFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="text-left text-xs text-slate-400 transition hover:text-white sm:text-right"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Empty state */}
        {filteredUsers.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 px-6 py-14 text-center">
            <h2 className="text-sm font-medium text-slate-300">
              No users found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {users.length === 0
                ? "Users will appear here when they register in your applications."
                : "Try changing your search or filters."}
            </p>
          </section>
        ) : (
          <>
            {/* Desktop table */}
            <section className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-225">
                  <thead>
                    <tr className="border-b border-slate-800 text-left">
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        User
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Application
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Role
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Verification
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Created
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-800/70 last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/platform/users/${user.id}`}
                            className="group block min-w-0"
                          >
                            <p className="truncate text-sm font-medium text-slate-200 transition group-hover:text-white">
                              {user.firstName} {user.lastName}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          {user.application ? (
                            <>
                              <p className="text-sm text-slate-300">
                                {user.application.name}
                              </p>

                              <p className="mt-1 font-mono text-xs text-slate-600">
                                {user.application.clientId}
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-slate-600">
                              Unknown
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                            {user.role}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            value={
                              user.emailVerified ? "VERIFIED" : "UNVERIFIED"
                            }
                            positive={user.emailVerified}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            value={user.status}
                            positive={user.status === "ACTIVE"}
                          />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mobile cards */}
            <section className="mt-6 space-y-3 md:hidden">
              {filteredUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/platform/users/${user.id}`}
                  className="block rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 hover:bg-slate-900/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-200">
                        {user.firstName} {user.lastName}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    <StatusBadge
                      value={user.status}
                      positive={user.status === "ACTIVE"}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                        Application
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-300">
                        {user.application?.name ?? "Unknown"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                        Role
                      </p>

                      <p className="mt-1 text-xs text-slate-300">{user.role}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                        Verification
                      </p>

                      <p
                        className={
                          user.emailVerified
                            ? "mt-1 text-xs text-emerald-400"
                            : "mt-1 text-xs text-amber-400"
                        }
                      >
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                        Created
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-3 text-3xl font-bold text-white">{value}</p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function StatusBadge({
  value,
  positive = false,
}: {
  value: string;
  positive?: boolean;
}) {
  return (
    <span
      className={
        positive
          ? "inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
          : "inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400"
      }
    >
      {value}
    </span>
  );
}
