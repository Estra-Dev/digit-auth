"use client";

import type { ReactNode } from "react";

import { useAuth } from "../lib/auth/auth-context";

export type SignedInProps = {
  children: ReactNode;
};

export function SignedIn({ children }: SignedInProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
