"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth/auth-context";

export type SignUpProps = {
  signInUrl?: string;
  onSuccess?: () => void;
  className?: string;
};

const inputStyle = {
  width: "100%",
  minWidth: 0,
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

    if (submittingRef.current) {
      return;
    }

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
  ) {
    const fieldId = `${id}-${fieldName}`;

    return (
      <div key={fieldName} style={{ minWidth: 0, marginBottom: "17px" }}>
        <label htmlFor={fieldId} style={labelStyle}>
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
          style={inputStyle}
        />
      </div>
    );
  }

  return (
    <section
      className={className}
      style={{
        width: "100%",
        maxWidth: "460px",
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
          Create your account
        </h2>

        <p
          style={{
            color: "#64748b",
            margin: 0,
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          Get started with your new account.
        </p>
      </div>

      {success ? (
        <div role="status" aria-live="polite">
          <div
            aria-hidden="true"
            style={{
              width: "42px",
              height: "42px",
              display: "grid",
              placeItems: "center",
              marginBottom: "16px",
              borderRadius: "50%",
              background: "#eff6ff",
              color: "#1e3a8a",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            ✓
          </div>

          <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>
            Account created
          </h3>

          <p
            style={{
              color: "#475569",
              fontSize: "14px",
              lineHeight: 1.7,
              margin: "0 0 18px",
            }}
          >
            Registration successful! Check your email for a verification link
            before signing in.
          </p>

          <a
            href={signInUrl}
            style={{
              display: "inline-flex",
              justifyContent: "center",
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "#172554",
              border: "1px solid #172554",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Continue to sign in
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="digit-auth-signup-names">
            {renderField(
              "first-name",
              "First name",
              firstName,
              setFirstName,
              "text",
              "given-name",
            )}

            {renderField(
              "last-name",
              "Last name",
              lastName,
              setLastName,
              "text",
              "family-name",
            )}
          </div>

          {renderField(
            "email",
            "Email address",
            email,
            setEmail,
            "email",
            "email",
          )}

          {renderField(
            "password",
            "Password",
            password,
            setPassword,
            showPassword ? "text" : "password",
            "new-password",
          )}

          {renderField(
            "confirm-password",
            "Confirm password",
            confirmPassword,
            setConfirmPassword,
            showPassword ? "text" : "password",
            "new-password",
          )}

          <style>{`
            .digit-auth-signup-names {
              display: grid;
              grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
              gap: 12px;
            }

            @media (max-width: 380px) {
              .digit-auth-signup-names {
                grid-template-columns: minmax(0, 1fr);
                gap: 0;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .digit-auth-signup-submit {
                transition: none !important;
              }
            }
          `}</style>

          <label
            htmlFor={`${id}-show-password`}
            style={{
              display: "inline-flex",
              gap: "8px",
              alignItems: "center",
              margin: "0 0 20px",
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
            Show passwords
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
            className="digit-auth-signup-submit"
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
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p
            style={{
              textAlign: "center",
              margin: "22px 0 0",
              fontSize: "13px",
              lineHeight: 1.7,
              color: "#64748b",
            }}
          >
            Already have an account?{" "}
            <a
              href={signInUrl}
              style={{
                color: "#1e3a8a",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign in
            </a>
          </p>
        </form>
      )}
    </section>
  );
}
