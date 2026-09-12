"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";

import { useAuth } from "../lib/auth/auth-context";

export type SignOutButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function SignOutButton({
  children = "Sign out",
  onClick,
  disabled,
  ...props
}: SignOutButtonProps) {
  const { logout } = useAuth();

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    await logout();
  }

  return (
    <button {...props} type="button" disabled={disabled} onClick={handleClick}>
      {children}
    </button>
  );
}
