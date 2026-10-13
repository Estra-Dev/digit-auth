"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/site-header";

import {
  platformLogin,
  resendPlatformVerificationEmail,
} from "@/lib/platform-auth/platform-auth";

export default function PlatformLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [requiresVerification, setRequiresVerification] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setRequiresVerification(false);
    setLoading(true);

    try {
      await platformLogin(email, password);

      router.push("/platform/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";

      setError(message);

      if (message.toLowerCase().includes("verify")) {
        setRequiresVerification(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      await resendPlatformVerificationEmail(email);

      setSuccess(
        "If an unverified account exists for this email, a verification email has been sent.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to resend verification email.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              DigitAuth
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Authentication infrastructure for your applications
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>

              <p className="mt-1 text-sm text-slate-400">
                Sign in to access your DigitAuth workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500 focus:ring-2 focus:ring-slate-700"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500 focus:ring-2 focus:ring-slate-700"
                />
              </div>
              <div className="flex justify-end">
                <Link
                  href="/platform/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {requiresVerification && (
              <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">
                  Your email address has not been verified yet. Check your inbox
                  for the verification email.
                </p>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="mt-3 text-sm font-medium text-white transition hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              </div>
            )}

            <div className="mt-6 border-t border-slate-800 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Need a DigitAuth account?
              </p>

              <Link
                href="/platform/register"
                className="mt-2 inline-block text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
