"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@digit-auth/react";
import { DashboardHeader } from "@/components/dashboard/header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { user, isLoading, isAuthenticated, authError } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authError) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, authError, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-900">
            Restoring your session...
          </p>

          <p className="mt-1 text-sm text-zinc-500">Please wait a moment.</p>
        </div>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">
            Unable to restore your session
          </h1>

          <p className="mt-2 text-sm text-zinc-500">{authError}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Try again
          </button>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-3 block w-full text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Back to login
          </button>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <DashboardSidebar />

      <main className="min-w-0 flex-1">
        <DashboardHeader />

        {children}
      </main>
    </div>
  );
}
