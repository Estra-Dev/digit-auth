"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { verifyPlatformEmail } from "@/lib/platform-auth/platform-auth";

type VerificationState =
  | {
      status: "loading";
    }
  | {
      status: "success";
    }
  | {
      status: "error";
      message: string;
    };

function getInitialState(token: string | null): VerificationState {
  if (!token) {
    return {
      status: "error",
      message: "Verification token is missing.",
    };
  }

  return {
    status: "loading",
  };
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const hasToken = typeof token === "string" && token.length > 0;

  const [state, setState] = useState<VerificationState>(() =>
    getInitialState(token),
  );

  useEffect(() => {
    if (!hasToken || token === null) {
      return;
    }

    const verifyToken = async (verificationToken: string) => {
      try {
        await verifyPlatformEmail(verificationToken);

        setState({
          status: "success",
        });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to verify your email.",
        });
      }
    };

    void verifyToken(token);
  }, [token, hasToken]);
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
        {state.status === "loading" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-white" />

            <h2 className="mt-6 text-xl font-semibold text-white">
              Verifying your email
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {state.status === "success" && (
          <>
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
              Email verified
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Your email has been successfully verified. You can now sign in to
              your DigitAuth workspace.
            </p>

            <Link
              href="/platform/login"
              className="mt-6 block w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Continue to sign in
            </Link>
          </>
        )}

        {state.status === "error" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-900/50 bg-red-950/30">
              <svg
                className="h-7 w-7 text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h2 className="mt-6 text-xl font-semibold text-white">
              Verification failed
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {state.message}
            </p>

            <Link
              href="/platform/login"
              className="mt-6 block w-full rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Return to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <Suspense
        fallback={<div className="text-sm text-slate-400">Loading...</div>}
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
