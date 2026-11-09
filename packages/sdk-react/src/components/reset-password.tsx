"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth/auth-context";
import {
  AuthBrand,
  AuthFrame,
  AuthTrustFooter,
  authInputStyle,
  authLabelStyle,
} from "./AuthPrimitives";

export type ResetPasswordProps = {
  signInUrl?: string;
  forgotPasswordUrl?: string;
  onSuccess?: () => void;
  className?: string;
};

export function ResetPassword({
  signInUrl = "/sign-in",
  forgotPasswordUrl = "/forgot-password",
  onSuccess,
  className,
}: ResetPasswordProps) {
  const { resetPassword } = useAuth();
  const id = useId();
  const submittingRef = useRef(false);

  const [token, setToken] = useState("");
  const [tokenChecked, setTokenChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    setToken(searchParams.get("token")?.trim() ?? "");
    setTokenChecked(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    setError("");

    if (!token) {
      setError(
        "This password reset link is invalid or missing its token. Please request a new reset link.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      await resetPassword({
        token,
        password,
        confirmPassword,
      });

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset your password. The link may be invalid or expired.",
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <AuthFrame className={className}>
      <AuthBrand />

      <header className="da-auth__header">
        <h2 className="da-auth__heading">
          Reset your password<span aria-hidden="true">.</span>
        </h2>

        <p className="da-auth__description">
          Choose a new password for your account.
        </p>
      </header>

      {success ? (
        <div role="status" aria-live="polite">
          <p className="da-auth__description">
            Your password has been reset successfully. You can now sign in using
            your new password.
          </p>

          <a className="da-auth__primary" href={signInUrl}>
            Continue to sign in
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {tokenChecked && !token && (
            <p className="da-auth__error" role="alert">
              This password reset link is missing its token or is invalid.
              <a href={forgotPasswordUrl}> Request a new reset link.</a>
            </p>
          )}

          {!tokenChecked && (
            <p className="da-auth__description" role="status">
              Checking your password reset link...
            </p>
          )}

          <div className="da-auth__field">
            <label htmlFor={`${id}-password`} style={authLabelStyle}>
              New password
            </label>

            <input
              id={`${id}-password`}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your new password"
              style={authInputStyle}
            />
          </div>

          <div className="da-auth__field">
            <label htmlFor={`${id}-confirm-password`} style={authLabelStyle}>
              Confirm new password
            </label>

            <input
              id={`${id}-confirm-password`}
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your new password"
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
            disabled={loading || !tokenChecked || !token}
            aria-busy={loading}
          >
            {loading && (
              <span className="da-auth__spinner" aria-hidden="true" />
            )}

            {loading ? "Resetting password..." : "Reset password"}
          </button>
        </form>
      )}

      <p className="da-auth__switch">
        Remember your password? <a href={signInUrl}>Sign in</a>
      </p>

      <AuthTrustFooter />
    </AuthFrame>
  );
}
