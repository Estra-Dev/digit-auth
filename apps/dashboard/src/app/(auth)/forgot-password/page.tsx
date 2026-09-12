"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { useAuth } from "@digit-auth/react";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [resetToken, setResetToken] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);
    setResetToken("");
    setIsLoading(true);

    try {
      const resetData = await forgotPassword(email);

      setSuccess(true);

      if (resetData?.resetToken) {
        setResetToken(resetData.resetToken);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to process your request. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const testResetLink = resetToken
    ? `/reset-password?token=${encodeURIComponent(resetToken)}`
    : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Forgot password?
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Enter your email and we&apos;ll send you a password reset link.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              If an account exists with that email, a password reset email has
              been sent.
            </div>

            {resetToken && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-800">
                  Development reset link
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  Your API is running in test mode, so the reset token was
                  returned directly for local testing.
                </p>

                <Link
                  href={testResetLink}
                  className="mt-3 inline-block text-sm font-medium text-zinc-900 underline hover:no-underline"
                >
                  Continue to reset password
                </Link>
              </div>
            )}

            <Link
              href="/login"
              className="block text-center text-sm font-medium text-zinc-900 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-zinc-500">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-zinc-900 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
