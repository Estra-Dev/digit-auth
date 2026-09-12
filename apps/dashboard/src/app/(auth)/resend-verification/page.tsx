"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { useAuth } from "@digit-auth/react";

export default function ResendVerificationPage() {
  const { resendVerificationEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccess("");
    setError("");
    setIsLoading(true);

    try {
      await resendVerificationEmail(email);

      setSuccess(
        "If an account exists with that email, a verification email has been sent.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to resend verification email.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Verify your email
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Enter your email and we&apos;ll send you a new verification link.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

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
            {isLoading ? "Sending..." : "Resend verification email"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          <Link
            href="/login"
            className="font-medium text-zinc-900 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
