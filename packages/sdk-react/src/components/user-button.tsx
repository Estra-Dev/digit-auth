"use client";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "../lib/auth/auth-context";

export type UserButtonProps = {
  showEmail?: boolean;
};

export function UserButton({ showEmail = true }: UserButtonProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && !containerRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  async function handleLogout() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await logout();
      setOpen(false);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Open menu for ${user.firstName} ${user.lastName}`}
      >
        <span aria-hidden="true">{initials}</span>{" "}
        <span>
          {user.firstName} {user.lastName}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            minWidth: "220px",
            marginTop: "8px",
          }}
        >
          <div>
            <strong>
              {user.firstName} {user.lastName}
            </strong>

            {showEmail && <div>{user.email}</div>}

            <div>
              {user.emailVerified ? "Email verified" : "Email not verified"}
            </div>
          </div>

          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            onClick={() => {
              void handleLogout();
            }}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
