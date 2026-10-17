"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PlatformAuthLayout from "@/components/platform/platform-auth-layout";

import {
  platformLogin,
  resendPlatformVerificationEmail,
} from "@/lib/platform-auth/platform-auth";

export default function PlatformLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setRequiresVerification(false);
    setLoading(true);

    try {
      await platformLogin(email, password);
      router.push("/platform/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";

      setError(message);

      if (message.toLowerCase().includes("verify")) {
        setRequiresVerification(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      await resendPlatformVerificationEmail(email);

      setSuccess(
        "If an unverified account exists for this email, a verification email has been sent.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to resend verification email.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <PlatformAuthLayout variant="login">
      <div className="platform-auth-form-heading">
        <span className="platform-auth-form-kicker">WELCOME BACK</span>
        <h2>Sign in to DigitAuth</h2>
        <p>Enter your credentials to access your developer workspace.</p>
      </div>

      <form onSubmit={handleSubmit} className="platform-auth-form">
        <div className="platform-auth-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="platform-auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="platform-auth-forgot">
          <Link href="/platform/forgot-password">Forgot password?</Link>
        </div>

        {error && (
          <div
            role="alert"
            className="platform-auth-message platform-auth-message--error"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="platform-auth-message platform-auth-message--success"
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="platform-auth-submit"
        >
          {loading ? (
            <>
              <span className="platform-auth-spinner" />
              Signing in...
            </>
          ) : (
            <>
              Sign in to your workspace
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>

      {requiresVerification && (
        <div className="platform-auth-verification">
          <p>
            Your email address has not been verified yet. Check your inbox for
            the verification email.
          </p>

          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      )}

      <div className="platform-auth-switch">
        <span>New to DigitAuth?</span>
        <Link href="/platform/register">Create an account</Link>
      </div>
    </PlatformAuthLayout>
  );
}
