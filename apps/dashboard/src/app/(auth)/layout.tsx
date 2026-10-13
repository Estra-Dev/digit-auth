import type { ReactNode } from "react";
import { AuthProvider } from "@digit-auth/react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      apiUrl={process.env.NEXT_PUBLIC_API_URL}
      publishableKey={process.env.NEXT_PUBLIC_DIGIT_AUTH_PUBLISHABLE_KEY!}
    >
      {children}
    </AuthProvider>
  );
}
