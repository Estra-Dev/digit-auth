"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@digit-auth/react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { resetPassword } = useAuth();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "This password reset link is invalid or missing its reset token.",
      );
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password.length > 100) {
      setError("Password must be 100 characters or less.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        token,
        password,
        confirmPassword,
      });

      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset your password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
              ✓
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Password reset successful
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Your password has been changed and your existing sessions have been
            signed out.
          </p>

          <p className="mt-4 text-xs text-zinc-400">
            Redirecting you to sign in...
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-zinc-900 hover:underline"
          >
            Sign in now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Reset password
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Choose a new password for your account.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              New password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 pr-20 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-zinc-900"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p className="mt-2 text-xs text-zinc-400">
              Maximum 100 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Confirm new password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 pr-20 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-zinc-900"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Resetting password..." : "Reset password"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          <Link
            href="/login"
            className="font-medium text-zinc-900 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
          <div className="text-sm text-zinc-500">Loading password reset...</div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
