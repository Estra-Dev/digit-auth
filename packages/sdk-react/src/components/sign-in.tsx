"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth/auth-context";
import {
  AuthBrand,
  AuthFrame,
  AuthTrustFooter,
  authInputStyle,
  authLabelStyle,
} from "./AuthPrimitives";

export type SignInProps = {
  signUpUrl?: string;
  resetPasswordUrl?: string;
  redirectUrl?: string;
  onSuccess?: () => void;
  className?: string;
};

export function SignIn({
  signUpUrl = "/sign-up",
  resetPasswordUrl = "/reset-password",
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

    if (submittingRef.current) return;

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
    <AuthFrame className={className}>
      <AuthBrand />

      <header className="da-auth__header">
        <h2 className="da-auth__heading">
          Welcome back<span aria-hidden="true">.</span>
        </h2>
        <p className="da-auth__description">
          Sign in to continue to your account.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="da-auth__field">
          <label htmlFor={`${id}-email`} style={authLabelStyle}>
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
            style={authInputStyle}
          />
        </div>

        <div className="da-auth__field">
          <div className="da-auth__meta" style={{ marginBottom: 8 }}>
            <label
              htmlFor={`${id}-password`}
              style={{ ...authLabelStyle, margin: 0 }}
            >
              Password
            </label>
            <a href={resetPasswordUrl} style={{ fontSize: 12 }}>
              Forgot password?
            </a>
          </div>

          <input
            id={`${id}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            style={authInputStyle}
          />
        </div>

        <label className="da-auth__check" htmlFor={`${id}-show-password`}>
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
            className="da-auth__error"
            id={`${id}-error`}
            role="alert"
            aria-live="polite"
            style={{ marginTop: 18 }}
          >
            {error}
          </p>
        )}

        <button
          className="da-auth__primary"
          type="submit"
          disabled={loading}
          aria-busy={loading}
        >
          {loading && <span className="da-auth__spinner" aria-hidden="true" />}
          {loading ? "Signing you in..." : "Sign in to your account"}
        </button>
      </form>

      <p className="da-auth__switch">
        New to this application? <a href={signUpUrl}>Create an account</a>
      </p>

      <AuthTrustFooter />
    </AuthFrame>
  );
}
