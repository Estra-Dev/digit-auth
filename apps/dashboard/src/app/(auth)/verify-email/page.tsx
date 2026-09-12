"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@digit-auth/react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const { verifyEmail } = useAuth();

  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(token !== null);

  const [isVerified, setIsVerified] = useState(false);

  const [error, setError] = useState(
    token === null ? "No verification token was provided." : "",
  );

  useEffect(() => {
    if (token === null) {
      return;
    }

    const verificationToken = token;

    let cancelled = false;

    async function verify() {
      try {
        await verifyEmail(verificationToken);

        if (!cancelled) {
          setIsVerified(true);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to verify your email.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token, verifyEmail]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Verifying your email...
          </h1>

          <p className="mt-3 text-sm text-zinc-600">
            Please wait while we verify your email address.
          </p>
        </div>
      </main>
    );
  }

  if (isVerified) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
            ✓
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-zinc-900">
            Email verified 🎉
          </h1>

          <p className="mt-3 text-sm text-zinc-600">
            Your email has been successfully verified. You can now log in to
            your account.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Continue to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
          !
        </div>

        <h1 className="mt-5 text-2xl font-semibold text-zinc-900">
          Verification failed
        </h1>

        <p className="mt-3 text-sm text-zinc-600">{error}</p>

        <div className="mt-6 space-y-3">
          <Link
            href="/resend-verification"
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Resend Verification Email
          </Link>

          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-zinc-900">Loading...</h1>
          </div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
