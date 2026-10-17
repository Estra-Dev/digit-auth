"use client";

import { useState, type ButtonHTMLAttributes, type MouseEvent } from "react";

import { useAuth } from "../lib/auth/auth-context";

export type SignOutButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Use DigitAuth's default navy button styling. */
  appearance?: "default" | "minimal" | "danger";
};

export function SignOutButton({
  children = "Sign out",
  onClick,
  disabled,
  appearance = "default",
  style,
  ...props
}: SignOutButtonProps) {
  const { logout } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);

    if (event.defaultPrevented || isSigningOut || disabled) {
      return;
    }

    setIsSigningOut(true);

    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  }

  const appearanceStyles = {
    default: {
      background: "#172554",
      color: "#ffffff",
      border: "1px solid #172554",
      hoverBackground: "#1e3a8a",
    },
    minimal: {
      background: "transparent",
      color: "#334155",
      border: "1px solid #e2e8f0",
      hoverBackground: "#f8fafc",
    },
    danger: {
      background: "#dc2626",
      color: "#ffffff",
      border: "1px solid #dc2626",
      hoverBackground: "#b91c1c",
    },
  }[appearance];

  return (
    <button
      {...props}
      type="button"
      disabled={disabled || isSigningOut}
      aria-busy={isSigningOut}
      onClick={handleClick}
      onMouseEnter={(event) => {
        if (!disabled && !isSigningOut) {
          event.currentTarget.style.background =
            appearanceStyles.hoverBackground;
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = appearanceStyles.background;
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 16px",
        borderRadius: "10px",
        background: appearanceStyles.background,
        color: appearanceStyles.color,
        border: appearanceStyles.border,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: "13px",
        fontWeight: 600,
        lineHeight: 1.4,
        cursor: disabled || isSigningOut ? "not-allowed" : "pointer",
        opacity: disabled || isSigningOut ? 0.65 : 1,
        boxShadow:
          appearance === "default"
            ? "0 1px 2px rgba(15, 23, 42, 0.08)"
            : "none",
        transition:
          "background 150ms ease, opacity 150ms ease, box-shadow 150ms ease",
        ...style,
      }}
    >
      {isSigningOut && (
        <svg
          aria-hidden="true"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ animation: "digitAuthSignOutSpin 0.8s linear infinite" }}
        >
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="m4.93 4.93 2.83 2.83" />
          <path d="m16.24 16.24 2.83 2.83" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
          <path d="m4.93 19.07 2.83-2.83" />
          <path d="m16.24 7.76 2.83-2.83" />
        </svg>
      )}

      {isSigningOut ? "Signing out..." : children}

      <style>{`
        @keyframes digitAuthSignOutSpin {
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          button, svg {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </button>
  );
}
