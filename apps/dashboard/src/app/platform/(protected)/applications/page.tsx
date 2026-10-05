"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
import { useWorkspace } from "@/lib/workspace/workspace-context";

export default function PlatformApplicationsPage() {
  const router = useRouter();

  const { workspace } = useWorkspace();
  const [applications, setApplications] = useState<PlatformApplication[]>([]);
  const [name, setName] = useState("");
  const [credentials, setCredentials] =
    useState<PlatformApplicationCredentials | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

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

    const applicationName = name.trim();

    if (!applicationName) {
      return;
    }

    try {
      setCreating(true);
      setError("");
      setCredentials(null);
      setCopied("");

      const result = await createPlatformApplication(applicationName);

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

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);

      window.setTimeout(() => {
        setCopied((current) => (current === label ? "" : current));
      }, 2000);
    } catch {
      setError("Failed to copy credential.");
    }
  }

  function openApplication(applicationId: string) {
    router.push(`/platform/applications/${applicationId}`);
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-sm text-slate-400">Loading applications...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-slate-500">{workspace.name}</p>

          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Applications
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Create and manage applications connected to your DigitAuth
                workspace.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              {applications.length}{" "}
              {applications.length === 1 ? "application" : "applications"}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3">
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

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <h2 className="text-lg font-semibold">Create application</h2>

            <p className="mt-1 text-sm text-slate-500">
              Create a new application and generate its credentials.
            </p>
          </div>

          <form
            onSubmit={handleCreate}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <div className="flex-1">
              <label htmlFor="application-name" className="sr-only">
                Application name
              </label>

              <input
                id="application-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. My SaaS Application"
                maxLength={100}
                disabled={creating}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500 focus:ring-2 focus:ring-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-sm text-emerald-400">
                    ✓
                  </span>

                  <h2 className="text-lg font-semibold text-emerald-400">
                    Application created
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Copy and store these credentials securely. The client secret
                  will not be shown again.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCredentials(null);
                  setCopied("");
                }}
                className="text-left text-sm text-slate-500 transition hover:text-white sm:text-right"
              >
                Hide credentials
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3">
              <p className="text-sm font-medium text-amber-400">
                Store your client secret now
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-500/80">
                DigitAuth stores only a secure hash of the secret. If you lose
                it, you will need to rotate the secret to generate a new one.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <CredentialRow
                label="Client ID"
                value={credentials.clientId}
                copied={copied === "Client ID"}
                onCopy={() => copyValue(credentials.clientId, "Client ID")}
              />

              <CredentialRow
                label="Client Secret"
                value={credentials.clientSecret}
                copied={copied === "Client Secret"}
                onCopy={() =>
                  copyValue(credentials.clientSecret, "Client Secret")
                }
                secret
              />
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
            <div>
              <h2 className="font-semibold">Your applications</h2>

              <p className="mt-1 text-xs text-slate-500">
                Applications registered in {workspace.name}.
              </p>
            </div>

            {applications.length > 0 && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {applications.length}
              </span>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-600">
                App
              </div>

              <p className="mt-4 text-sm font-medium text-slate-300">
                No applications have been created yet.
              </p>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-600">
                Create your first application above to start using DigitAuth
                authentication.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {applications.map((application) => (
                <div
                  key={application.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openApplication(application.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openApplication(application.id);
                    }
                  }}
                  className="group flex cursor-pointer flex-col gap-5 px-6 py-6 outline-none transition hover:bg-slate-800/40 focus-visible:bg-slate-800/40 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-white">
                        {application.name}
                      </h3>

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

                    <p className="mt-2 truncate font-mono text-xs text-slate-500">
                      {application.clientId}
                    </p>

                    <p className="mt-2 text-xs text-slate-600 transition group-hover:text-slate-400">
                      Click to view details →
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
  copied,
  onCopy,
  secret = false,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => Promise<void>;
  secret?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="flex items-center gap-3">
        <code
          className={`min-w-0 flex-1 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-xs text-slate-300 ${
            secret ? "break-all" : "whitespace-nowrap"
          }`}
        >
          {value}
        </code>

        <button
          type="button"
          onClick={() => void onCopy()}
          className="shrink-0 rounded-lg border border-slate-700 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
