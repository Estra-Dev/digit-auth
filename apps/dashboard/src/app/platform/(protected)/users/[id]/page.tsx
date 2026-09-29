"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getPlatformUser } from "@/lib/platform-auth/platform-auth";
import type { PlatformUser } from "@/types/platform-auth";

export default function PlatformUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const userId = params.id;

  const [user, setUser] = useState<PlatformUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        setError("");

        const data = await getPlatformUser(userId);

        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load user.",
          );
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(label);

      window.setTimeout(() => {
        setCopied((current) => (current === label ? "" : current));
      }, 2000);
    } catch {
      setError("Failed to copy value.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Loading user...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => router.push("/platform/users")}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to users
          </button>

          <div className="mt-8 rounded-2xl border border-red-900/50 bg-red-950/30 p-6">
            <p className="text-sm text-red-400">{error || "User not found."}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/platform/users")}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to users
        </button>

        {/* Header */}
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="wrap-break-word text-2xl font-bold tracking-tight sm:text-3xl">
                {user.firstName} {user.lastName}
              </h1>

              <StatusBadge
                value={user.status}
                positive={user.status === "ACTIVE"}
              />
            </div>

            <p className="mt-2 break-all text-sm text-slate-500">
              {user.email}
            </p>
          </div>

          <div
            className={
              user.emailVerified
                ? "rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400"
                : "rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400"
            }
          >
            {user.emailVerified ? "Email verified" : "Email unverified"}
          </div>
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

        {/* User information */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">User information</h2>

            <p className="mt-1 text-sm text-slate-500">
              Account information for this DigitAuth user.
            </p>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <InfoItem label="First name" value={user.firstName} />

            <InfoItem label="Last name" value={user.lastName} />

            <InfoItem
              label="Email"
              value={user.email}
              copyable
              copied={copied === "Email"}
              onCopy={() => copyValue(user.email, "Email")}
            />

            <InfoItem label="Role" value={user.role} />

            <InfoItem label="Account status" value={user.status} />

            <InfoItem
              label="Email verification"
              value={user.emailVerified ? "VERIFIED" : "UNVERIFIED"}
              positive={user.emailVerified}
            />

            <InfoItem
              label="Created"
              value={new Date(user.createdAt).toLocaleString()}
            />

            <InfoItem
              label="Last updated"
              value={new Date(user.updatedAt).toLocaleString()}
            />
          </div>
        </section>

        {/* Application */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Application</h2>

            <p className="mt-1 text-sm text-slate-500">
              The DigitAuth application this user belongs to.
            </p>
          </div>

          {user.application ? (
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-slate-200">
                    {user.application.name}
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-slate-500">
                    {user.application.clientId}
                  </p>
                </div>

                <StatusBadge
                  value={user.application.status}
                  positive={user.application.status === "ACTIVE"}
                />
              </div>

              <div className="mt-5 border-t border-slate-800 pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                  Application ID
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <code className="min-w-0 break-all font-mono text-xs text-slate-400">
                    {user.application.id}
                  </code>

                  <button
                    type="button"
                    onClick={() =>
                      void copyValue(user.application!.id, "Application ID")
                    }
                    className="w-fit shrink-0 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    {copied === "Application ID" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-800 px-5 py-8 text-center">
              <p className="text-sm text-slate-500">
                No application information is available for this user.
              </p>
            </div>
          )}
        </section>

        {/* User ID */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">System information</h2>

            <p className="mt-1 text-sm text-slate-500">
              Internal identifiers for this user.
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
              User ID
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="min-w-0 break-all rounded-lg bg-slate-950 px-4 py-3 font-mono text-xs text-slate-400">
                {user.id}
              </code>

              <button
                type="button"
                onClick={() => void copyValue(user.id, "User ID")}
                className="w-fit shrink-0 rounded-lg border border-slate-700 px-4 py-2.5 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                {copied === "User ID" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoItem({
  label,
  value,
  copyable = false,
  copied = false,
  positive = false,
  onCopy,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  copied?: boolean;
  positive?: boolean;
  onCopy?: () => Promise<void>;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-start gap-3">
        <p
          className={
            positive
              ? "break-all text-sm text-emerald-400"
              : "break-all text-sm text-slate-200"
          }
        >
          {value}
        </p>

        {copyable && onCopy && (
          <button
            type="button"
            onClick={() => void onCopy()}
            className="shrink-0 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
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
          ? "inline-flex w-fit rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
          : "inline-flex w-fit rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400"
      }
    >
      {value}
    </span>
  );
}
