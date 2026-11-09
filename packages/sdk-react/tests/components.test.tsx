import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../src/lib/auth/auth-context";
import { tokenStorage } from "../src/lib/auth/token-storage";
import { ForgotPassword } from "../src/components/forgot-password";
import { ResetPassword } from "../src/components/reset-password";

const mockFetch = vi.fn<typeof fetch>();

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(
    JSON.stringify({
      success: status >= 200 && status < 300,
      message: status < 400 ? "Success" : "Request failed",
      data,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider
      apiUrl="http://localhost:5000/api/v1"
      publishableKey="pk_test_example"
    >
      {children}
    </AuthProvider>
  );
}

describe("ForgotPassword", () => {
  beforeEach(() => {
    tokenStorage.clear();
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
    window.history.replaceState({}, "", "/forgot-password");
  });

  afterEach(() => {
    cleanup();
    tokenStorage.clear();
    vi.unstubAllGlobals();
  });

  it("renders the password recovery form", async () => {
    render(<ForgotPassword />, { wrapper });

    expect(
      screen.getByRole("heading", { name: /forgot your password/i }),
    ).toBeTruthy();

    expect(screen.getByLabelText(/email address/i)).toBeTruthy();

    expect(
      screen.getByRole("button", { name: /send reset instructions/i }),
    ).toBeTruthy();
  });

  it("submits the email address to DigitAuth", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ resetToken: null }));

    render(<ForgotPassword />, { wrapper });

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /send reset instructions/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain(
        "password reset link has been sent",
      );
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0]!;

    expect(url).toBe(
      "http://localhost:5000/api/v1/browser/auth/forgot-password",
    );

    expect(options?.method).toBe("POST");

    expect(JSON.parse(String(options?.body))).toEqual({
      email: "test@example.com",
    });
  });

  it("shows an error when the recovery request fails", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: "Request failed" }, 500),
    );

    render(<ForgotPassword />, { wrapper });

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /send reset instructions/i }),
    );

    expect(await screen.findByRole("alert")).toBeTruthy();
  });

  it("provides a link back to sign in", () => {
    render(<ForgotPassword signInUrl="/login" />, { wrapper });

    expect(
      screen.getByRole("link", { name: /sign in/i }).getAttribute("href"),
    ).toBe("/login");
  });
});

describe("ResetPassword", () => {
  beforeEach(() => {
    tokenStorage.clear();
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
    window.history.replaceState(
      {},
      "",
      "/reset-password?token=valid-reset-token",
    );
  });

  afterEach(() => {
    cleanup();
    tokenStorage.clear();
    vi.unstubAllGlobals();
  });

  it("reads the reset token from the URL", async () => {
    render(<ResetPassword />, { wrapper });

    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: /reset password/i })
          .hasAttribute("disabled"),
      ).toBe(false);
    });
  });

  it("submits the new password and reset token to DigitAuth", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(null));

    render(<ResetPassword />, { wrapper });

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "NewSecurePassword123!" },
    });

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "NewSecurePassword123!" },
    });

    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: /reset password/i })
          .hasAttribute("disabled"),
      ).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/password has been reset successfully/i),
      ).toBeTruthy();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0]!;

    expect(url).toBe(
      "http://localhost:5000/api/v1/browser/auth/reset-password",
    );

    expect(options?.method).toBe("POST");

    expect(JSON.parse(String(options?.body))).toEqual({
      token: "valid-reset-token",
      password: "NewSecurePassword123!",
      confirmPassword: "NewSecurePassword123!",
    });
  });

  it("rejects passwords that do not match", async () => {
    render(<ResetPassword />, { wrapper });

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "NewSecurePassword123!" },
    });

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "DifferentPassword123!" },
    });

    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: /reset password/i })
          .hasAttribute("disabled"),
      ).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Your passwords do not match.",
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("shows a recovery link when the URL has no reset token", async () => {
    window.history.replaceState({}, "", "/reset-password");

    render(<ResetPassword forgotPasswordUrl="/forgot-password" />, {
      wrapper,
    });

    const recoveryLink = await screen.findByRole("link", {
      name: /request a new reset link/i,
    });

    expect(recoveryLink.getAttribute("href")).toBe("/forgot-password");

    expect(
      screen
        .getByRole("button", { name: /reset password/i })
        .hasAttribute("disabled"),
    ).toBe(true);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("shows an error when DigitAuth rejects the reset token", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: "Invalid or expired reset token" }, 400),
    );

    render(<ResetPassword />, { wrapper });

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "NewSecurePassword123!" },
    });

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "NewSecurePassword123!" },
    });

    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: /reset password/i })
          .hasAttribute("disabled"),
      ).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findByRole("alert")).toBeTruthy();
  });
});
