"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          DigitAuth
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Authentication infrastructure for your applications
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-700 bg-slate-950">
          <svg
            className="h-7 w-7 text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="mt-6 text-xl font-semibold text-white">
          Account created
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Your DigitAuth account and workspace have been created successfully.
        </p>

        {email && (
          <p className="mt-4 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            {email}
          </p>
        )}

        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-left">
          <p className="text-sm font-medium text-white">
            Email verification is next
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            We&apos;ll use your email to verify ownership before giving you
            access to your workspace.
          </p>
        </div>

        <Link
          href="/platform/login"
          className="mt-6 block w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Continue to sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <Suspense
        fallback={
          <div className="w-full max-w-md text-center">
            <p className="text-sm text-slate-400">Loading...</p>
          </div>
        }
      >
        <RegistrationSuccessContent />
      </Suspense>
    </main>
  );
}
