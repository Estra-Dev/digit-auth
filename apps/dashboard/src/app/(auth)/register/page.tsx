"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@digit-auth/react";

export default function RegisterPage() {
  const router = useRouter();

  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      });

      setSuccess("Account created successfully. Please verify your email.");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Create account
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Create your account to get started.
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                First name
              </label>

              <input
                id="firstName"
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                placeholder="John"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Last name
              </label>

              <input
                id="lastName"
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                placeholder="Doe"
              />
            </div>
          </div>

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
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
