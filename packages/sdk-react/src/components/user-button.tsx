"use client";

import { useState } from "react";

import { useAuth } from "../lib/auth/auth-context";

export type UserButtonProps = {
  showEmail?: boolean;
};

export function UserButton({ showEmail = true }: UserButtonProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const [open, setOpen] = useState(false);

  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span>{initials}</span>{" "}
        <span>
          {user.firstName} {user.lastName}
        </span>
      </button>

      {open && (
        <div role="menu">
          <div>
            <strong>
              {user.firstName} {user.lastName}
            </strong>

            {showEmail && <div>{user.email}</div>}
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
