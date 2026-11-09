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

export type ForgotPasswordProps = {
  signInUrl?: string;
  onSuccess?: () => void;
  className?: string;
};

export function ForgotPassword({
  signInUrl = "/sign-in",
  onSuccess,
  className,
}: ForgotPasswordProps) {
  const { forgotPassword } = useAuth();
  const id = useId();
  const submittingRef = useRef(false);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await forgotPassword(email.trim());

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process your request. Please try again.",
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
          Forgot your password<span aria-hidden="true">?</span>
        </h2>

        <p className="da-auth__description">
          Enter the email address associated with your account. If an account
          exists, you will receive instructions to reset your password.
        </p>
      </header>

      {success ? (
        <div role="status" aria-live="polite">
          <p className="da-auth__description">
            If an account exists for that email address, a password reset link
            has been sent. Please check your inbox.
          </p>
        </div>
      ) : (
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
            {loading && (
              <span className="da-auth__spinner" aria-hidden="true" />
            )}

            {loading ? "Sending instructions..." : "Send reset instructions"}
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
