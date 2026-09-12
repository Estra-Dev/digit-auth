"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@digit-auth/react";

export function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div>
        <p className="text-sm font-medium text-zinc-900">Dashboard</p>
        <p className="text-xs text-zinc-500">Manage your DigitAuth account</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-zinc-900">
            {user?.firstName} {user?.lastName}
          </p>

          <p className="text-xs text-zinc-500">{user?.email}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
          {initials}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
