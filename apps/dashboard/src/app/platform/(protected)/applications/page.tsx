"use client";

import { useEffect, useState } from "react";
import {
  activatePlatformApplication,
  createPlatformApplication,
  getPlatformApplications,
  suspendPlatformApplication,
} from "@/lib/platform-auth/platform-auth";
import type {
  PlatformApplication,
  PlatformApplicationCredentials,
} from "@/types/platform-auth";
import { useRouter } from "next/navigation";

export default function PlatformApplicationsPage() {
  const [applications, setApplications] = useState<PlatformApplication[]>([]);

  const [name, setName] = useState("");
  const [credentials, setCredentials] =
    useState<PlatformApplicationCredentials | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");

        const data = await getPlatformApplications();

        if (!cancelled) {
          setApplications(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load applications.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setCreating(true);
      setError("");
      setCredentials(null);

      const result = await createPlatformApplication(name.trim());

      setApplications((current) => [result.application, ...current]);

      setCredentials(result.credentials);
      setName("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create application.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(application: PlatformApplication) {
    try {
      setActionId(application.id);
      setError("");

      const updated =
        application.status === "ACTIVE"
          ? await suspendPlatformApplication(application.id)
          : await activatePlatformApplication(application.id);

      setApplications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update application.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function copyValue(value: string) {
    await navigator.clipboard.writeText(value);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-sm text-slate-400">Loading applications...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-slate-400">Platform Management</p>

          <h1 className="mt-1 text-3xl font-bold">Applications</h1>

          <p className="mt-2 text-sm text-slate-400">
            Create and manage applications connected to DigitAuth.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Create application</h2>

          <form
            onSubmit={handleCreate}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Application name"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-slate-500 focus:ring-2 focus:ring-slate-700"
            />

            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create application"}
            </button>
          </form>
        </section>

        {credentials && (
          <section className="mb-8 rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-6">
            <h2 className="text-lg font-semibold text-emerald-400">
              Application created
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Save the client secret now. It will not be shown again.
            </p>

            <div className="mt-5 space-y-4">
              <CredentialRow
                label="Client ID"
                value={credentials.clientId}
                onCopy={() => copyValue(credentials.clientId)}
              />

              <CredentialRow
                label="Client Secret"
                value={credentials.clientSecret}
                onCopy={() => copyValue(credentials.clientSecret)}
              />
            </div>

            <button
              type="button"
              onClick={() => setCredentials(null)}
              className="mt-5 text-sm text-slate-400 hover:text-white"
            >
              Hide credentials
            </button>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="font-semibold">Your applications</h2>
          </div>

          {applications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-400">
                No applications have been created yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {applications.map((application) => (
                <div
                  key={application.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    router.push(`/platform/applications/${application.id}`)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      router.push(`/platform/applications/${application.id}`);
                    }
                  }}
                  className="flex cursor-pointer flex-col gap-5 px-6 py-6 transition hover:bg-slate-800/40 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold">{application.name}</h3>

                      <span
                        className={
                          application.status === "ACTIVE"
                            ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                            : "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400"
                        }
                      >
                        {application.status}
                      </span>
                    </div>

                    <p className="mt-2 truncate text-sm text-slate-500">
                      {application.clientId}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={actionId === application.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleToggle(application);
                    }}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionId === application.id
                      ? "Updating..."
                      : application.status === "ACTIVE"
                        ? "Suspend"
                        : "Activate"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CredentialRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => Promise<void>;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="flex items-center gap-3">
        <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
          {value}
        </code>

        <button
          type="button"
          onClick={() => void onCopy()}
          className="rounded-lg border border-slate-700 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
