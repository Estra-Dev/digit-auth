"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPlatformAccount,
  hasPlatformSession,
} from "@/lib/platform-auth/platform-auth";

export default function PlatformProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuthentication() {
      if (!hasPlatformSession()) {
        router.replace("/platform/login");
        return;
      }

      try {
        await getPlatformAccount();
        setChecking(false);
      } catch {
        router.replace("/platform/login");
      }
    }

    void checkAuthentication();
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">Checking authentication...</p>
      </main>
    );
  }

  return children;
}
