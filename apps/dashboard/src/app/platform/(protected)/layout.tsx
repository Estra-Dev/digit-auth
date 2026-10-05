"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PlatformSidebar from "@/components/platform/sidebar";
import PlatformHeader from "@/components/platform/header";
import {
  getCurrentWorkspace,
  getPlatformAccount,
  hasPlatformSession,
} from "@/lib/platform-auth/platform-auth";
import { WorkspaceProvider } from "@/lib/workspace/workspace-context";

type Workspace = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function PlatformProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuthentication() {
      if (!hasPlatformSession()) {
        router.replace("/platform/login");
        return;
      }

      try {
        const [, currentWorkspace] = await Promise.all([
          getPlatformAccount(),
          getCurrentWorkspace(),
        ]);

        if (!cancelled) {
          setWorkspace(currentWorkspace);
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
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (checking || !workspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">Loading workspace...</p>
      </main>
    );
  }

  return (
    <WorkspaceProvider workspace={workspace}>
      <div className="min-h-screen bg-slate-950">
        <div className="flex min-h-screen">
          <PlatformSidebar
            mobileOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <PlatformHeader onMenuClick={() => setMobileSidebarOpen(true)} />

            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
