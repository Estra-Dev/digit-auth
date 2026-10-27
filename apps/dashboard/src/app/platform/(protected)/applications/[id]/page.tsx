"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  activatePlatformApplication,
  getPlatformApplication,
  rotatePlatformApplicationSecret,
  suspendPlatformApplication,
  updatePlatformApplicationAllowedOrigins,
  updatePlatformApplicationWebhook,
  rotatePlatformApplicationWebhookSecret,
} from "@/lib/platform-auth/platform-auth";
import type {
  PlatformApplication,
  PlatformApplicationCredentials,
} from "@/types/platform-auth";
import { useWorkspace } from "@/lib/workspace/workspace-context";

export default function PlatformApplicationDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { workspace } = useWorkspace();

  const applicationId = params.id;

  const [application, setApplication] = useState<PlatformApplication | null>(
    null,
  );

  const [originsText, setOriginsText] = useState("");
  const [savingOrigins, setSavingOrigins] = useState(false);
  const [originsMessage, setOriginsMessage] = useState("");

  const [webhookUrl, setWebhookUrl] = useState("");
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState("");

  const [rotatingWebhookSecret, setRotatingWebhookSecret] = useState(false);
  const [webhookSigningSecret, setWebhookSigningSecret] = useState<
    string | null
  >(null);

  const [credentials, setCredentials] =
    useState<PlatformApplicationCredentials | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");

        const data = await getPlatformApplication(applicationId);

        if (!cancelled) {
          setApplication(data);
          setOriginsText((data.allowedOrigins ?? []).join("\n"));
          setWebhookUrl(data.webhookUrl ?? "");
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

  async function handleSaveOrigins() {
    if (!application) return;

    const allowedOrigins = [
      ...new Set(
        originsText
          .split(/\r?\n/)
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    ];

    try {
      setSavingOrigins(true);
      setError("");
      setOriginsMessage("");

      const updated = await updatePlatformApplicationAllowedOrigins(
        application.id,
        allowedOrigins,
      );

      setApplication(updated);
      setOriginsText((updated.allowedOrigins ?? []).join("\n"));
      setOriginsMessage("Allowed origins saved successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save allowed origins.",
      );
    } finally {
      setSavingOrigins(false);
    }
  }

  async function handleSaveWebhook() {
    if (!application) return;

    const normalizedUrl = webhookUrl.trim();

    try {
      setSavingWebhook(true);
      setError("");
      setWebhookMessage("");

      const updated = await updatePlatformApplicationWebhook(
        application.id,
        normalizedUrl || null,
      );

      setApplication(updated);
      setWebhookUrl(updated.webhookUrl ?? "");
      setWebhookMessage(
        updated.webhookUrl
          ? "Webhook URL saved successfully."
          : "Webhook disabled successfully.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update webhook settings.",
      );
    } finally {
      setSavingWebhook(false);
    }
  }

  async function handleRotateWebhookSecret() {
    if (!application) return;

    const confirmed = window.confirm(
      "Rotate the webhook signing secret? The current secret will stop working immediately. Update your webhook receiver with the new secret.",
    );

    if (!confirmed) return;

    try {
      setRotatingWebhookSecret(true);
      setError("");
      setWebhookSigningSecret(null);

      const result = await rotatePlatformApplicationWebhookSecret(
        application.id,
      );

      setApplication(result.application);
      setWebhookSigningSecret(result.signingSecret);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to rotate webhook signing secret.",
      );
    } finally {
      setRotatingWebhookSecret(false);
    }
  }

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
      "Rotate this application's client secret?\n\nThe current secret will immediately stop being valid. You will need to update any service using the old secret.",
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setCredentials(null);
      setCopied("");

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
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-sm text-slate-400">Loading application...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => router.push("/platform/applications")}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to applications
          </button>

          <div className="mt-8 rounded-2xl border border-red-900/50 bg-red-950/30 p-6">
            <p className="text-sm text-red-400">
              {error || "Application not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <button
          type="button"
          onClick={() => router.push("/platform/applications")}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to applications
        </button>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="mb-3 text-sm text-slate-500">{workspace.name}</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="wrap-break-word text-3xl font-bold tracking-tight">
                {application.name}
              </h1>

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

            <p className="mt-2 break-all font-mono text-xs text-slate-600">
              ID: {application.id}
            </p>
          </div>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => void handleToggle()}
            className="shrink-0 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading
              ? "Updating..."
              : application.status === "ACTIVE"
                ? "Suspend application"
                : "Activate application"}
          </button>
        </div>

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

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <h2 className="text-lg font-semibold">Application information</h2>

            <p className="mt-1 text-sm text-slate-500">
              Basic information and identifiers for this workspace application.
            </p>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <InfoItem label="Name" value={application.name} />

            <InfoItem label="Status" value={application.status} />

            <InfoItem
              label="Client ID"
              value={application.clientId}
              copyable
              copied={copied === "Client ID"}
              onCopy={() => copyValue(application.clientId, "Client ID")}
            />

            <InfoItem
              label="Application ID"
              value={application.id}
              copyable
              copied={copied === "Application ID"}
              onCopy={() => copyValue(application.id, "Application ID")}
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
          <div>
            <h2 className="text-lg font-semibold">Allowed origins</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Register the websites that may use this applications browser
              authentication. Enter one origin per line, without a path.
            </p>
          </div>

          <div className="mt-5">
            <label
              htmlFor="allowed-origins"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Website origins
            </label>

            <textarea
              id="allowed-origins"
              value={originsText}
              onChange={(event) => {
                setOriginsText(event.target.value);
                setOriginsMessage("");
              }}
              placeholder={"http://localhost:5173\nhttps://your-domain.com"}
              rows={5}
              spellCheck={false}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Examples: http://localhost:5173 or https://app.example.com. Do not
              include a trailing path such as /login.
            </p>
          </div>

          {originsMessage && (
            <p className="mt-4 text-sm text-emerald-400" role="status">
              {originsMessage}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={savingOrigins}
              onClick={() => void handleSaveOrigins()}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingOrigins ? "Saving..." : "Save origins"}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <h2 className="text-lg font-semibold">Webhooks</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Configure an HTTPS endpoint to receive authentication events from
              DigitAuth. Use an endpoint on your server, not a browser page.
            </p>
          </div>

          <div className="mt-5">
            <label
              htmlFor="webhook-url"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Webhook endpoint URL
            </label>

            <input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(event) => {
                setWebhookUrl(event.target.value);
                setWebhookMessage("");
              }}
              placeholder="https://api.example.com/webhooks/digit-auth"
              spellCheck={false}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Leave the field empty to disable the webhook. Production endpoints
              must use HTTPS.
            </p>
          </div>

          {webhookMessage && (
            <p className="mt-4 text-sm text-emerald-400" role="status">
              {webhookMessage}
            </p>
          )}

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {application.webhookUrl && (
              <button
                type="button"
                disabled={savingWebhook}
                onClick={() => {
                  setWebhookUrl("");
                  setWebhookMessage("");
                }}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear URL
              </button>
            )}

            <button
              type="button"
              disabled={savingWebhook}
              onClick={() => void handleSaveWebhook()}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingWebhook ? "Saving..." : "Save webhook"}
            </button>
          </div>
          {application.webhookUrl && (
            <div className="mt-6 border-t border-slate-800 pt-5">
              <h3 className="text-sm font-semibold text-slate-200">
                Webhook signing secret
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Use this secret to verify webhook signatures on your server.
                Rotating it invalidates the previous secret.
              </p>

              <button
                type="button"
                disabled={rotatingWebhookSecret}
                onClick={() => void handleRotateWebhookSecret()}
                className="mt-4 rounded-lg border border-amber-700 px-4 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {rotatingWebhookSecret
                  ? "Rotating..."
                  : "Rotate signing secret"}
              </button>

              {webhookSigningSecret && (
                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
                  <p
                    className="text-sm font-medium text-emerald-400"
                    role="status"
                  >
                    New signing secret generated. Copy it now; it will not be
                    shown again.
                  </p>

                  <code className="mt-3 block break-all text-sm text-slate-200">
                    {webhookSigningSecret}
                  </code>

                  <button
                    type="button"
                    onClick={() =>
                      void copyValue(
                        webhookSigningSecret,
                        "Webhook signing secret",
                      )
                    }
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                  >
                    Copy signing secret
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Client secret</h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                The client secret is used by your application when communicating
                securely with the DigitAuth authentication service.
              </p>
            </div>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => void handleRotateSecret()}
              className="shrink-0 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? "Rotating..." : "Rotate secret"}
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-amber-900/50 bg-amber-950/20 p-5">
            <p className="text-sm font-medium text-amber-400">
              Keep your secret secure
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-500/80">
              DigitAuth never displays the existing client secret. Rotating it
              immediately invalidates the previous secret and generates a new
              one.
            </p>
          </div>

          {credentials && (
            <div className="mt-5 rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-sm text-emerald-400">
                  ✓
                </span>

                <p className="text-sm font-medium text-emerald-400">
                  New client secret generated
                </p>
              </div>

              <p className="mt-2 text-sm leading-5 text-slate-400">
                Copy this secret now. It will not be shown again after you leave
                this page or hide it.
              </p>

              <CredentialRow
                label="Client secret"
                value={credentials.clientSecret}
                copied={copied === "Client Secret"}
                onCopy={() =>
                  copyValue(credentials.clientSecret, "Client Secret")
                }
              />

              <button
                type="button"
                onClick={() => {
                  setCredentials(null);
                  setCopied("");
                }}
                className="mt-4 text-xs text-slate-500 transition hover:text-white"
              >
                Hide secret
              </button>
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
  copied = false,
  onCopy,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  copied?: boolean;
  onCopy?: () => Promise<void>;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-start gap-3">
        <p className="min-w-0 break-all text-sm text-slate-200">{value}</p>

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

function CredentialRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => Promise<void>;
}) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <code className="min-w-0 flex-1 overflow-x-auto break-all rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-xs leading-5 text-slate-300">
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
