"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DigitAuthLogo from "@/components/digit-auth-logo";

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link
          href="/"
          aria-label="DigitAuth home"
          className="inline-flex items-center justify-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10 text-blue-400">
            <DigitAuthLogo className="h-8 w-8" />
          </span>
          <span className="text-2xl font-bold tracking-tight">
            Digit<span className="text-blue-500">Auth</span>
          </span>
        </Link>

        <p className="mt-3 text-sm" style={{ color: "var(--site-muted)" }}>
          Authentication infrastructure for your applications
        </p>
      </div>

      <section
        className="rounded-2xl border p-8 text-center shadow-2xl sm:p-9"
        style={{
          background: "var(--site-surface)",
          borderColor: "var(--site-border)",
          color: "var(--site-text)",
        }}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10">
          <svg
            className="h-7 w-7 text-emerald-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m5 12 4 4L19 6"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Account created
        </h1>

        <p
          className="mt-3 text-sm leading-6"
          style={{ color: "var(--site-muted)" }}
        >
          Your DigitAuth account and workspace have been created successfully.
        </p>

        {email && (
          <p
            className="mt-5 break-all rounded-xl border px-4 py-3 text-sm"
            style={{
              background: "var(--site-bg)",
              borderColor: "var(--site-border)",
              color: "var(--site-text)",
            }}
          >
            {email}
          </p>
        )}

        <div
          className="mt-5 rounded-xl border p-4 text-left"
          style={{
            background: "var(--site-bg)",
            borderColor: "var(--site-border)",
          }}
        >
          <p className="text-sm font-semibold">
            One more step: verify your email
          </p>
          <p
            className="mt-2 text-xs leading-6"
            style={{ color: "var(--site-muted)" }}
          >
            Check your inbox for the DigitAuth verification email. Open the
            verification link to confirm your email address before signing in.
            If it is not there, check your spam or junk folder.
          </p>
        </div>

        <Link
          href="/platform/login"
          className="mt-6 block w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Continue to sign in
        </Link>
      </section>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-12"
      style={{
        background: "var(--site-bg)",
        color: "var(--site-text)",
      }}
    >
      <Suspense
        fallback={
          <p className="text-sm" style={{ color: "var(--site-muted)" }}>
            Loading...
          </p>
        }
      >
        <RegistrationSuccessContent />
      </Suspense>
    </main>
  );
}
