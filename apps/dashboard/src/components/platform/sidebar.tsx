"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { platformLogout } from "@/lib/platform-auth/platform-auth";

const navigation = [
  {
    name: "Overview",
    href: "/platform/dashboard",
  },
  {
    name: "Applications",
    href: "/platform/applications",
  },
];

export default function PlatformSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await platformLogout();
    router.replace("/platform/login");
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-6 py-5">
        <h1 className="text-lg font-bold text-white">DigitAuth</h1>

        <p className="mt-1 text-xs text-slate-500">Platform</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
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

      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
