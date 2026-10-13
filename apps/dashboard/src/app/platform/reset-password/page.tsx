import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-6">
          <p className="text-sm text-muted-foreground">
            Loading password reset page...
          </p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
