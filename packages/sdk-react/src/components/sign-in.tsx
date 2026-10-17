"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth/auth-context";

export type SignInProps = {
  signUpUrl?: string;
  redirectUrl?: string;
  onSuccess?: () => void;
  className?: string;
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "12px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  fontSize: "14px",
  lineHeight: 1.5,
  color: "#0f172a",
  background: "#ffffff",
  outlineOffset: "2px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#334155",
  fontSize: "13px",
  fontWeight: 600,
};

export function SignIn({
  signUpUrl = "/sign-up",
  redirectUrl = "/",
  onSuccess,
  className,
}: SignInProps) {
  const { login } = useAuth();
  const id = useId();
  const submittingRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setError("");
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
      submittingRef.current = false;
      setLoading(false);
      return;
    }

    try {
      onSuccess?.();
    } finally {
      if (redirectUrl) {
        window.location.assign(redirectUrl);
      } else {
        submittingRef.current = false;
        setLoading(false);
      }
    }
  }

  return (
    <section
      className={className}
      style={{
        width: "100%",
        maxWidth: "420px",
        margin: "0 auto",
        padding: "32px",
        boxSizing: "border-box",
        background: "#ffffff",
        color: "#0f172a",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        boxShadow: "0 12px 35px rgba(15, 23, 42, 0.06)",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ marginBottom: "26px" }}>
        <div
          style={{
            color: "#1e3a8a",
            fontWeight: 800,
            fontSize: "12px",
            letterSpacing: "1.5px",
          }}
        >
          DIGIT AUTH
        </div>

        <h2
          style={{
            margin: "12px 0 8px",
            fontSize: "27px",
            lineHeight: 1.25,
            letterSpacing: "-0.7px",
          }}
        >
          Welcome back
        </h2>

        <p
          style={{
            color: "#64748b",
            margin: 0,
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          Sign in to continue to your account.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "18px" }}>
          <label htmlFor={`${id}-email`} style={labelStyle}>
            Email address
          </label>

          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor={`${id}-password`} style={labelStyle}>
            Password
          </label>

          <input
            id={`${id}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            style={inputStyle}
          />
        </div>

        <label
          htmlFor={`${id}-show-password`}
          style={{
            display: "inline-flex",
            gap: "8px",
            alignItems: "center",
            margin: "13px 0 20px",
            fontSize: "13px",
            color: "#475569",
            cursor: "pointer",
          }}
        >
          <input
            id={`${id}-show-password`}
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          Show password
        </label>

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            aria-live="polite"
            style={{
              margin: "0 0 16px",
              padding: "11px 12px",
              color: "#b91c1c",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "9px",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px",
            padding: "13px 16px",
            border: "1px solid #172554",
            borderRadius: "10px",
            background: loading ? "#475569" : "#172554",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.8 : 1,
            transition: "background 150ms ease, opacity 150ms ease",
          }}
        >
          {loading && (
            <span
              aria-hidden="true"
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#ffffff",
                borderRadius: "50%",
                animation: "digitAuthSignInSpin 700ms linear infinite",
              }}
            />
          )}
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <style>{`
          @keyframes digitAuthSignInSpin {
            to { transform: rotate(360deg); }
          }

          @media (prefers-reduced-motion: reduce) {
            button, span {
              animation: none !important;
              transition: none !important;
            }
          }
        `}</style>
      </form>

      <p
        style={{
          textAlign: "center",
          margin: "22px 0 0",
          fontSize: "13px",
          lineHeight: 1.7,
          color: "#64748b",
        }}
      >
        Don't have an account?{" "}
        <a
          href={signUpUrl}
          style={{
            color: "#1e3a8a",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Create account
        </a>
      </p>
    </section>
  );
}
