"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  activatePlatformApplication,
  getPlatformApplication,
  rotatePlatformApplicationSecret,
  suspendPlatformApplication,
} from "@/lib/platform-auth/platform-auth";
import type {
  PlatformApplication,
  PlatformApplicationCredentials,
} from "@/types/platform-auth";

export default function PlatformApplicationDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const applicationId = params.id;

  const [application, setApplication] = useState<PlatformApplication | null>(
    null,
  );

  const [credentials, setCredentials] =
    useState<PlatformApplicationCredentials | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");

        const data = await getPlatformApplication(applicationId);

        if (!cancelled) {
          setApplication(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load application.",
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
  }, [applicationId]);

  async function handleToggle() {
    if (!application) return;

    try {
      setActionLoading(true);
      setError("");

      const updated =
        application.status === "ACTIVE"
          ? await suspendPlatformApplication(application.id)
          : await activatePlatformApplication(application.id);

      setApplication(updated);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update application.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRotateSecret() {
    if (!application) return;

    const confirmed = window.confirm(
      "Rotate this application's client secret? The current secret will stop being valid.",
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setCredentials(null);

      const result = await rotatePlatformApplicationSecret(application.id);

      setApplication(result.application);
      setCredentials(result.credentials);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to rotate client secret.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function copyValue(value: string) {
    await navigator.clipboard.writeText(value);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-sm text-slate-400">Loading application...</p>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <button
          type="button"
          onClick={() => router.push("/platform/applications")}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to applications
        </button>

        <div className="mt-8 rounded-2xl border border-red-900/50 bg-red-950/30 p-6">
          <p className="text-sm text-red-400">
            {error || "Application not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <button
          type="button"
          onClick={() => router.push("/platform/applications")}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to applications
        </button>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{application.name}</h1>

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

            <p className="mt-2 text-sm text-slate-500">
              Application ID: {application.id}
            </p>
          </div>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => void handleToggle()}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading
              ? "Updating..."
              : application.status === "ACTIVE"
                ? "Suspend application"
                : "Activate application"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Application information</h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <InfoItem label="Name" value={application.name} />

            <InfoItem label="Status" value={application.status} />

            <InfoItem
              label="Client ID"
              value={application.clientId}
              copyable
              onCopy={() => copyValue(application.clientId)}
            />

            <InfoItem
              label="Created"
              value={new Date(application.createdAt).toLocaleString()}
            />

            <InfoItem
              label="Last updated"
              value={new Date(application.updatedAt).toLocaleString()}
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Client secret</h2>

              <p className="mt-1 text-sm text-slate-400">
                Rotate the secret if the current credential has been compromised
                or needs to be replaced.
              </p>
            </div>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => void handleRotateSecret()}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Rotate secret
            </button>
          </div>

          {credentials && (
            <div className="mt-6 rounded-xl border border-amber-900/50 bg-amber-950/20 p-5">
              <p className="text-sm font-medium text-amber-400">
                New client secret generated
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Save this secret now. It will not be shown again.
              </p>

              <CredentialRow
                label="Client secret"
                value={credentials.clientSecret}
                onCopy={() => copyValue(credentials.clientSecret)}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoItem({
  label,
  value,
  copyable = false,
  onCopy,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => Promise<void>;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-3">
        <p className="min-w-0 break-all text-sm text-slate-200">{value}</p>

        {copyable && onCopy && (
          <button
            type="button"
            onClick={() => void onCopy()}
            className="shrink-0 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Copy
          </button>
        )}
      </div>
    </div>
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
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="flex gap-3">
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
