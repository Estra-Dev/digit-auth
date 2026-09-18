"use client";

import { useState, type ButtonHTMLAttributes, type MouseEvent } from "react";

import { useAuth } from "../lib/auth/auth-context";

export type SignOutButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function SignOutButton({
  children = "Sign out",
  onClick,
  disabled,
  ...props
}: SignOutButtonProps) {
  const { logout } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);

    if (event.defaultPrevented || isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <button
      {...props}
      type="button"
      disabled={disabled || isSigningOut}
      onClick={handleClick}
    >
      {isSigningOut ? "Signing out..." : children}
    </button>
  );
}
