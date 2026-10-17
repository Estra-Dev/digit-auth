import { StrictMode } from "react";

import {
  act,
  cleanup,
  render,
  renderHook,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "../src/lib/auth/auth-context";
import { tokenStorage } from "../src/lib/auth/token-storage";
import type { AuthenticatedUser, LoginResponse } from "../src/types/auth";

const mockFetch = vi.fn<typeof fetch>();

const testUser: AuthenticatedUser = {
  id: "user-123",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  emailVerified: true,
};

const loginResponse: LoginResponse = {
  user: testUser,
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

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

describe("AuthProvider", () => {
  beforeEach(() => {
    tokenStorage.clear();
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    cleanup();
    tokenStorage.clear();
    vi.unstubAllGlobals();
  });

  it("starts unauthenticated when no refresh token exists", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.authError).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("restores the user when a refresh token exists", async () => {
    tokenStorage.setAccessToken("saved-access");
    tokenStorage.setRefreshToken("saved-refresh");

    mockFetch.mockResolvedValueOnce(jsonResponse(testUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual(testUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.authError).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("clears saved tokens when session restoration fails", async () => {
    tokenStorage.setAccessToken("saved-access");
    tokenStorage.setRefreshToken("saved-refresh");

    mockFetch.mockResolvedValueOnce(jsonResponse(null, 401));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.authError).not.toBeNull();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it("stores tokens and authenticates the user after login", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(loginResponse));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login({
        email: "test@example.com",
        password: "correct-password",
      });
    });

    expect(result.current.user).toEqual(testUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(tokenStorage.getAccessToken()).toBe("access-token");
    expect(tokenStorage.getRefreshToken()).toBe("refresh-token");

    const [url, options] = mockFetch.mock.calls[0]!;

    expect(url).toBe("http://localhost:5000/api/v1/browser/auth/login");
    expect(options?.method).toBe("POST");
    expect(JSON.parse(String(options?.body))).toEqual({
      email: "test@example.com",
      password: "correct-password",
    });
  });

  it("clears tokens and exposes the error when login fails", async () => {
    tokenStorage.setAccessToken("old-access");
    tokenStorage.setRefreshToken("old-refresh");

    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: "Invalid credentials" }, 401),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.login({
          email: "test@example.com",
          password: "wrong-password",
        }),
      ).rejects.toThrow();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.authError).not.toBeNull();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it("clears authentication state after logout", async () => {
    tokenStorage.setAccessToken("access-token");
    tokenStorage.setRefreshToken("refresh-token");

    mockFetch
      .mockResolvedValueOnce(jsonResponse(testUser))
      .mockResolvedValueOnce(jsonResponse(null));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(testUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it("clears authentication state even if the logout request fails", async () => {
    tokenStorage.setAccessToken("access-token");
    tokenStorage.setRefreshToken("refresh-token");

    mockFetch
      .mockResolvedValueOnce(jsonResponse(testUser))
      .mockResolvedValueOnce(jsonResponse(null, 500));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(testUser);
    });

    await act(async () => {
      await expect(result.current.logout()).rejects.toThrow();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it("throws when useAuth is used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used inside an AuthProvider",
    );
  });

  it("automatically verifies an email token and removes it from the URL", async () => {
    window.history.replaceState(
      {},
      "",
      "/?token=valid-token&next=%2Faccount#continue",
    );

    mockFetch.mockResolvedValueOnce(jsonResponse(null));

    render(
      <AuthProvider
        apiUrl="http://localhost:5000/api/v1"
        publishableKey="pk_test_example"
      >
        <div>Application content</div>
      </AuthProvider>,
    );

    expect(
      await waitFor(() => {
        expect(document.body.textContent).toContain("Email verified");
        return true;
      }),
    ).toBe(true);

    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?next=%2Faccount");
    expect(window.location.hash).toBe("#continue");

    expect(document.body.textContent).not.toContain("Application content");

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0]!;

    expect(url).toBe("http://localhost:5000/api/v1/browser/auth/verify-email");
    expect(options?.method).toBe("POST");
    expect(JSON.parse(String(options?.body))).toEqual({
      token: "valid-token",
    });
  });

  it("shows an error when the verification token is rejected", async () => {
    window.history.replaceState({}, "", "/?token=expired-token");

    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: "Invalid verification token" }, 400),
    );

    render(
      <AuthProvider
        apiUrl="http://localhost:5000/api/v1"
        publishableKey="pk_test_example"
      >
        <div>Application content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(document.body.textContent).toContain("couldn't verify your email");
    });

    expect(window.location.search).toBe("");
    expect(document.body.textContent).not.toContain("Application content");
  });

  it("does not submit the same verification token twice in Strict Mode", async () => {
    window.history.replaceState({}, "", "/?token=strict-mode-token");

    mockFetch.mockResolvedValueOnce(jsonResponse(null));

    render(
      <StrictMode>
        <AuthProvider
          apiUrl="http://localhost:5000/api/v1"
          publishableKey="pk_test_example"
        >
          <div>Application content</div>
        </AuthProvider>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(document.body.textContent).toContain("Email verified");
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
