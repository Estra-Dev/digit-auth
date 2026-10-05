"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { platformLogout } from "@/lib/platform-auth/platform-auth";
import { useWorkspace } from "@/lib/workspace/workspace-context";

const navigation = [
  { name: "Overview", href: "/platform/dashboard" },
  { name: "Applications", href: "/platform/applications" },
  { name: "Users", href: "/platform/users" },
  { name: "Sessions", href: "/platform/sessions" },
];

type PlatformSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export default function PlatformSidebar({
  mobileOpen,
  onClose,
}: PlatformSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { workspace } = useWorkspace();

  async function handleLogout() {
    await platformLogout();
    router.replace("/platform/login");
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950",
          "transform transition-transform duration-200 ease-in-out",
          "lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-5">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white">DigitAuth</h1>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {workspace.name}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white lg:hidden"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={
                  active
                    ? "block rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white"
                    : "block rounded-lg px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
                }
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-800 p-4">
          <div className="mb-3 rounded-lg bg-slate-900 px-4 py-3">
            <p className="text-xs text-slate-500">Workspace</p>

            <p className="mt-1 truncate text-sm font-medium text-slate-300">
              {workspace.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">{workspace.status}</p>
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
