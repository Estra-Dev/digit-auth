"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@digit-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login({
        email,
        password,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to login. Please try again.",
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
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-zinc-500">Sign in to your account.</p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
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

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          {"Don't have an account?"}{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-900 hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}
