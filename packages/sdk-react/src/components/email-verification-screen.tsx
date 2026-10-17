import type { ReactNode } from "react";

import { AuthBrand, AuthFrame, AuthTrustFooter } from "./AuthPrimitives";

export type EmailVerificationState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

type EmailVerificationScreenProps = {
  state: EmailVerificationState;
  onContinue: () => void;
};

function StatusIcon({ status }: { status: EmailVerificationState["status"] }) {
  let content: ReactNode;

  if (status === "loading") {
    content = <span className="da-auth__spinner" aria-hidden="true" />;
  } else if (status === "success") {
    content = "✓";
  } else {
    content = "!";
  }

  return (
    <div
      className="da-auth__success-mark"
      role="img"
      aria-label={
        status === "loading"
          ? "Verification in progress"
          : status === "success"
            ? "Verification successful"
            : "Verification failed"
      }
      style={
        status === "error"
          ? {
              color: "#fca5a5",
              borderColor: "rgba(248, 113, 113, .3)",
              background: "rgba(127, 29, 29, .2)",
            }
          : undefined
      }
    >
      {content}
    </div>
  );
}

export function EmailVerificationScreen({
  state,
  onContinue,
}: EmailVerificationScreenProps) {
  const isLoading = state.status === "loading";
  const isSuccess = state.status === "success";

  const heading = isLoading
    ? "Verifying your email"
    : isSuccess
      ? "Email verified"
      : "We couldn't verify your email";

  const description = isLoading
    ? "Please wait while DigitAuth securely confirms your email address."
    : isSuccess
      ? "Your email address has been confirmed successfully. You're ready to continue to your account."
      : state.message;

  return (
    <main
      style={{
        minHeight: "100%",
        width: "100%",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px",
      }}
    >
      <AuthFrame>
        <AuthBrand />

        <StatusIcon status={state.status} />

        <header className="da-auth__header">
          <h1 className="da-auth__heading">{heading}</h1>
          <p className="da-auth__description" role="status" aria-live="polite">
            {description}
          </p>
        </header>

        {!isLoading && (
          <button
            type="button"
            className="da-auth__primary"
            onClick={onContinue}
          >
            {isSuccess ? "Continue to sign in" : "Return to sign in"}
          </button>
        )}

        <AuthTrustFooter />
      </AuthFrame>
    </main>
  );
}
