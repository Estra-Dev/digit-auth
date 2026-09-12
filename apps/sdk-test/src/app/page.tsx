"use client";

import { FormEvent, useState } from "react";

import {
  AuthProvider,
  ProtectedRoute,
  SignOutButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@digit-auth/react";

function LoginForm() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Sign in</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="password">Password</label>
          <br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <br />

        {error && <p>{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}

function ProtectedContent() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute
      loading={<p>Checking protected content...</p>}
      fallback={<p>You must be signed in to see this content.</p>}
    >
      <section>
        <h2>Protected Content</h2>

        <p>Only authenticated users can see this section.</p>

        <p>Welcome, {user.firstName}.</p>
      </section>
    </ProtectedRoute>
  );
}

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <main>Checking authentication...</main>;
  }

  return (
    <main>
      <h1>DigitAuth SDK Test</h1>

      <p>
        This application uses only the public API exposed by{" "}
        <code>@digit-auth/react</code>.
      </p>

      <SignedIn>
        <ProtectedContent />
      </SignedIn>

      <SignedOut>
        <LoginForm />
      </SignedOut>
    </main>
  );
}

export default function Home() {
  return (
    <AuthProvider apiUrl="http://localhost:5000/api/v1">
      <App />
    </AuthProvider>
  );
}
