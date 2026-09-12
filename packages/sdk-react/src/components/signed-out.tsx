"use client";

import type { ReactNode } from "react";

import { useAuth } from "../lib/auth/auth-context";

export type SignedOutProps = {
  children: ReactNode;
};

export function SignedOut({ children }: SignedOutProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading || isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
