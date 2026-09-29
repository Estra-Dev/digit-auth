"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPlatformAccount,
  hasPlatformSession,
} from "@/lib/platform-auth/platform-auth";
import PlatformSidebar from "@/components/platform/sidebar";
import PlatformHeader from "@/components/platform/header";

export default function PlatformProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuthentication() {
      if (!hasPlatformSession()) {
        router.replace("/platform/login");
        return;
      }

      try {
        await getPlatformAccount();

        if (!cancelled) {
          setChecking(false);
        }
      } catch {
        if (!cancelled) {
          router.replace("/platform/login");
        }
      }
    }

    void checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">
          Checking authentication...
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex min-h-screen">
        <PlatformSidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <PlatformHeader
            onMenuClick={() =>
              setMobileSidebarOpen(true)
            }
          />

          <div className="min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
