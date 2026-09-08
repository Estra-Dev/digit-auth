"use client";

import { useAuth } from "@/lib/auth/auth-context";

export function DashboardHeader() {
  const { user } = useAuth();

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div>
        <p className="text-sm font-medium text-zinc-900">Dashboard</p>
        <p className="text-xs text-zinc-500">Manage your DigitAuth account</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-zinc-900">
            {user?.firstName} {user?.lastName}
          </p>

          <p className="text-xs text-zinc-500">{user?.email}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}
