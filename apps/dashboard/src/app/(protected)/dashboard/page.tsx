"use client";
import { useAuth } from "@digit-auth/react";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8">
      <section>
        <p className="text-sm font-medium text-zinc-500">Overview</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
          Welcome back, {user?.firstName}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Here is an overview of your DigitAuth account.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-medium text-zinc-500">Account</p>

          <p className="mt-3 text-lg font-semibold text-zinc-950">Active</p>

          <p className="mt-1 text-xs text-zinc-500">
            Your account is currently active.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-medium text-zinc-500">
            Email verification
          </p>

          <p className="mt-3 text-lg font-semibold text-zinc-950">
            {user?.emailVerified ? "Verified" : "Not verified"}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {user?.emailVerified
              ? "Your email address has been verified."
              : "Please verify your email address."}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-zinc-500">Account email</p>

          <p className="mt-3 truncate text-lg font-semibold text-zinc-950">
            {user?.email}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Your primary authentication email.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-500">Getting started</p>

        <h2 className="mt-2 text-lg font-semibold text-zinc-950">
          Manage your account
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Use the navigation to manage your profile, security settings, and
          active sessions. More account management features will be added as we
          continue building DigitAuth.
        </p>
      </section>
    </div>
  );
}
