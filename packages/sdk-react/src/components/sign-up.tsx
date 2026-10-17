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

export type SignUpProps = {
  signInUrl?: string;
  onSuccess?: () => void;
  className?: string;
};

export function SignUp({
  signInUrl = "/sign-in",
  onSuccess,
  className,
}: SignUpProps) {
  const { register } = useAuth();
  const id = useId();
  const submittingRef = useRef(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    setError("");

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again.",
      );
      submittingRef.current = false;
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    submittingRef.current = false;

    onSuccess?.();
  }

  function renderField(
    fieldName: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    type = "text",
    autoComplete?: string,
    placeholder?: string,
  ) {
    const fieldId = `${id}-${fieldName}`;

    return (
      <div className="da-auth__field" key={fieldName}>
        <label htmlFor={fieldId} style={authLabelStyle}>
          {label}
        </label>
        <input
          id={fieldId}
          name={fieldName}
          type={type}
          autoComplete={autoComplete}
          autoCapitalize={type === "email" ? "none" : undefined}
          spellCheck={type === "email" ? false : undefined}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={authInputStyle}
        />
      </div>
    );
  }

  return (
    <AuthFrame className={className}>
      <AuthBrand />

      <header className="da-auth__header">
        <h2 className="da-auth__heading">
          Create your account<span aria-hidden="true">.</span>
        </h2>
        <p className="da-auth__description">
          A few details and you're ready to get started.
        </p>
      </header>

      {success ? (
        <div role="status" aria-live="polite">
          <div className="da-auth__success">
            <div className="da-auth__success-mark" aria-hidden="true">
              ✓
            </div>

            <h3
              style={{
                margin: "0 0 9px",
                fontSize: 19,
                letterSpacing: "-.3px",
              }}
            >
              Account created
            </h3>

            <p className="da-auth__description" style={{ marginBottom: 20 }}>
              Registration was successful. Check your email for a verification
              link before signing in.
            </p>

            <a
              href={signInUrl}
              className="da-auth__primary"
              style={{ textDecoration: "none", marginTop: 0 }}
            >
              Continue to sign in
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="da-auth__field-grid">
            {renderField(
              "first-name",
              "First name",
              firstName,
              setFirstName,
              "text",
              "given-name",
              "Your first name",
            )}

            {renderField(
              "last-name",
              "Last name",
              lastName,
              setLastName,
              "text",
              "family-name",
              "Your last name",
            )}
          </div>

          {renderField(
            "email",
            "Email address",
            email,
            setEmail,
            "email",
            "email",
            "you@example.com",
          )}

          {renderField(
            "password",
            "Password",
            password,
            setPassword,
            showPassword ? "text" : "password",
            "new-password",
            "Create a password",
          )}

          {renderField(
            "confirm-password",
            "Confirm password",
            confirmPassword,
            setConfirmPassword,
            showPassword ? "text" : "password",
            "new-password",
            "Enter your password again",
          )}

          <label className="da-auth__check" htmlFor={`${id}-show-password`}>
            <input
              id={`${id}-show-password`}
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
            />
            Show passwords
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
            {loading && (
              <span className="da-auth__spinner" aria-hidden="true" />
            )}
            {loading ? "Creating your account..." : "Create account"}
          </button>

          <p className="da-auth__switch">
            Already have an account? <a href={signInUrl}>Sign in</a>
          </p>
        </form>
      )}

      <AuthTrustFooter />
    </AuthFrame>
  );
}
