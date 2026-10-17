"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PlatformAuthLayout from "@/components/platform/platform-auth-layout";

import { platformRegister } from "@/lib/platform-auth/platform-auth";

export default function PlatformRegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await platformRegister(email, password);

      router.push(
        `/platform/register/success?email=${encodeURIComponent(email)}`,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PlatformAuthLayout variant="register">
      <div className="platform-auth-form-heading">
        <span className="platform-auth-form-kicker">GET STARTED</span>
        <h2>Create your account</h2>
        <p>
          Set up your developer account and start managing your applications.
        </p>
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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <span className="platform-auth-field-hint">
            Use at least 8 characters.
          </span>
        </div>

        <div className="platform-auth-field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Enter your password again"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {error && (
          <div
            role="alert"
            className="platform-auth-message platform-auth-message--error"
          >
            {error}
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
              Creating account...
            </>
          ) : (
            <>
              Create developer account
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>

        <p className="platform-auth-terms">
          By creating an account, you can set up a workspace to manage your
          DigitAuth applications.
        </p>
      </form>

      <div className="platform-auth-switch">
        <span>Already have an account?</span>
        <Link href="/platform/login">Sign in</Link>
      </div>
    </PlatformAuthLayout>
  );
}
