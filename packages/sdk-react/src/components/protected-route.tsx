"use client";

import type { ReactNode } from "react";

import { useAuth } from "../lib/auth/auth-context";

export type ProtectedRouteProps = {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
};

export function ProtectedRoute({
  children,
  fallback = null,
  loading = null,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
