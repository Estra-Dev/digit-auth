"use client";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "../lib/auth/auth-context";

export type UserButtonProps = {
  showEmail?: boolean;
  userProfileUrl?: string;
};

export function UserButton({
  showEmail = true,
  userProfileUrl,
}: UserButtonProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

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

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() ||
    user.email.charAt(0).toUpperCase();

  const colors = {
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#64748b",
    border: "#e2e8f0",
    navy: "#172554",
    navyHover: "#1e3a8a",
    subtle: "#f8fafc",
    danger: "#dc2626",
  };

  async function handleLogout() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await logout();
      setOpen(false);
    } finally {
      setIsSigningOut(false);
    }
  }

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "11px 14px",
    border: "none",
    borderRadius: "9px",
    background: "transparent",
    color: colors.foreground,
    fontSize: "13px",
    fontWeight: 500,
    textAlign: "left" as const,
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: colors.foreground,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Open account menu for ${fullName || user.email}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "6px 11px 6px 6px",
          border: `1px solid ${open ? "#cbd5e1" : colors.border}`,
          borderRadius: "999px",
          background: colors.background,
          color: colors.foreground,
          cursor: "pointer",
          boxShadow: open
            ? "0 4px 14px rgba(15, 23, 42, 0.08)"
            : "0 1px 2px rgba(15, 23, 42, 0.04)",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "grid",
            placeItems: "center",
            width: "36px",
            height: "36px",
            flexShrink: 0,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.navy}, #334e8c)`,
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {initials}
        </span>

        <span
          style={{
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {fullName || user.email}
        </span>

        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            color: colors.muted,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms ease",
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User account menu"
          style={{
            position: "absolute",
            zIndex: 1000,
            top: "calc(100% + 10px)",
            right: 0,
            width: "min(320px, calc(100vw - 32px))",
            boxSizing: "border-box",
            padding: "8px",
            border: `1px solid ${colors.border}`,
            borderRadius: "16px",
            background: colors.background,
            boxShadow:
              "0 18px 45px rgba(15, 23, 42, 0.12), 0 3px 10px rgba(15, 23, 42, 0.04)",
            animation: "digitAuthMenuIn 140ms ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "13px 10px 15px",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                width: "44px",
                height: "44px",
                flexShrink: 0,
                borderRadius: "13px",
                background: `linear-gradient(135deg, ${colors.navy}, #334e8c)`,
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {initials}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                title={fullName}
                style={{
                  overflow: "hidden",
                  color: colors.foreground,
                  fontSize: "14px",
                  fontWeight: 700,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fullName || "Your account"}
              </div>

              {showEmail && (
                <div
                  title={user.email}
                  style={{
                    marginTop: "4px",
                    overflow: "hidden",
                    color: colors.muted,
                    fontSize: "12px",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "0 4px 8px",
              padding: "9px 10px",
              borderRadius: "9px",
              background: colors.subtle,
              fontSize: "12px",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                width: "20px",
                height: "20px",
                flexShrink: 0,
                borderRadius: "50%",
                background: user.emailVerified ? "#dcfce7" : "#fef3c7",
                color: user.emailVerified ? "#166534" : "#92400e",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {user.emailVerified ? "✓" : "!"}
            </span>

            <span
              style={{
                flex: 1,
                color: user.emailVerified ? "#166534" : "#92400e",
                fontWeight: 600,
              }}
            >
              {user.emailVerified ? "Email verified" : "Email not verified"}
            </span>
          </div>

          <div
            style={{
              height: "1px",
              margin: "5px 4px 7px",
              background: colors.border,
            }}
          />

          {userProfileUrl && (
            <a
              href={userProfileUrl}
              role="menuitem"
              onClick={() => setOpen(false)}
              style={menuItemStyle}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = colors.subtle;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "transparent";
              }}
            >
              <svg
                aria-hidden="true"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              </svg>

              <span style={{ flex: 1 }}>Manage account</span>

              <svg
                aria-hidden="true"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: colors.muted }}
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          )}

          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            onClick={() => {
              void handleLogout();
            }}
            style={{
              ...menuItemStyle,
              marginTop: "3px",
              color: colors.danger,
              opacity: isSigningOut ? 0.6 : 1,
              cursor: isSigningOut ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "#fef2f2";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent";
            }}
          >
            <svg
              aria-hidden="true"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>

            <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
          </button>

          <div
            style={{
              padding: "9px 10px 5px",
              color: "#94a3b8",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            Secured by DigitAuth
          </div>
        </div>
      )}

      <style>{`
        @keyframes digitAuthMenuIn {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
