"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";

import { createApiClient } from "../api-client";
import { createAuthService } from "./auth.service";
import { tokenStorage } from "./token-storage";

import {
  EmailVerificationScreen,
  type EmailVerificationState,
} from "../../components/email-verification-screen";

import type {
  AuthenticatedUser,
  AuthSession,
  ForgotPasswordResponse,
  ResetPasswordRequest,
} from "../../types/auth";

type AuthContextValue = {
  apiClient: ReturnType<typeof createApiClient>;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;

  refreshUser: () => Promise<void>;

  login: (data: { email: string; password: string }) => Promise<void>;

  register: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;

  logout: () => Promise<void>;

  logoutAll: () => Promise<void>;

  verifyEmail: (token: string) => Promise<void>;

  resendVerificationEmail: (email: string) => Promise<void>;

  getSessions: () => Promise<AuthSession[]>;

  revokeSession: (sessionId: string) => Promise<void>;

  revokeOtherSessions: () => Promise<void>;

  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;

  resetPassword: (data: ResetPasswordRequest) => Promise<void>;

  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;

  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export type AuthProviderProps = {
  children: ReactNode;
  apiUrl?: string;
  publishableKey: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function AuthProvider({
  children,
  apiUrl,
  publishableKey,
}: AuthProviderProps) {
  const apiClient = useMemo(
    () =>
      createApiClient({
        ...(apiUrl !== undefined ? { baseUrl: apiUrl } : {}),
        publishableKey,
      }),
    [apiUrl, publishableKey],
  );

  const authService = useMemo(() => createAuthService(apiClient), [apiClient]);

  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [authError, setAuthError] = useState<string | null>(null);

  const [emailVerification, setEmailVerification] =
    useState<EmailVerificationState | null>(null);

  const processedVerificationToken = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token === null) {
      return;
    }

    if (processedVerificationToken.current === token) {
      return;
    }

    processedVerificationToken.current = token;

    // Remove the sensitive token from the visible URL immediately,
    // while preserving the path, other query parameters, and hash.
    url.searchParams.delete("token");

    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );

    setEmailVerification({ status: "loading" });

    // The backend remains the authority on verification success.
    // No effect cleanup cancels this request, so React Strict Mode's
    // development effect replay cannot strand the screen in loading.
    void authService.verifyEmail(token).then(
      () => {
        setEmailVerification({ status: "success" });
      },
      (error: unknown) => {
        setEmailVerification({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "This verification link may be invalid or expired. Request a new verification email and try again.",
        });
      },
    );
  }, [authService]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();

      setUser(response.data);
      setAuthError(null);
    } catch (error) {
      setUser(null);
      setAuthError(getErrorMessage(error, "Unable to load the current user."));

      throw error;
    }
  }, [authService]);

  const login = useCallback(
    async (data: { email: string; password: string }) => {
      setAuthError(null);

      try {
        const response = await authService.login(data);

        tokenStorage.setAccessToken(response.data.accessToken);

        tokenStorage.setRefreshToken(response.data.refreshToken);

        setUser(response.data.user);
      } catch (error) {
        tokenStorage.clear();
        setUser(null);

        const message = getErrorMessage(error, "Unable to sign in.");

        setAuthError(message);

        throw error;
      }
    },
    [authService],
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
    }) => {
      setAuthError(null);

      try {
        await authService.register(data);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Unable to create your account.",
        );

        setAuthError(message);

        throw error;
      }
    },
    [authService],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } finally {
      tokenStorage.clear();
      setUser(null);
      setAuthError(null);
    }
  }, [authService]);

  const logoutAll = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await authService.logoutAll(refreshToken);
      }
    } finally {
      tokenStorage.clear();
      setUser(null);
      setAuthError(null);
    }
  }, [authService]);

  const verifyEmail = useCallback(
    async (token: string) => {
      setAuthError(null);

      try {
        await authService.verifyEmail(token);
      } catch (error) {
        const message = getErrorMessage(error, "Unable to verify your email.");

        setAuthError(message);

        throw error;
      }
    },
    [authService],
  );

  const resendVerificationEmail = useCallback(
    async (email: string) => {
      setAuthError(null);

      try {
        await authService.resendVerificationEmail(email);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Unable to resend the verification email.",
        );

        setAuthError(message);

        throw error;
      }
    },
    [authService],
  );

  const getSessions = useCallback(async () => {
    const response = await authService.getSessions();

    return response.data;
  }, [authService]);

  const revokeSession = useCallback(
    async (sessionId: string) => {
      await authService.revokeSession(sessionId);
    },
    [authService],
  );

  const revokeOtherSessions = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token is available.");
    }

    await authService.revokeOtherSessions(refreshToken);
  }, [authService]);

  const forgotPassword = useCallback(
    async (email: string) => {
      setAuthError(null);

      try {
        const response = await authService.forgotPassword(email);

        return response.data;
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Unable to process the password reset request.",
        );

        setAuthError(message);

        throw error;
      }
    },
    [authService],
  );

  const resetPassword = useCallback(
    async (data: ResetPasswordRequest) => {
      setAuthError(null);

      try {
        await authService.resetPassword(data);
      } catch (error) {
        const message = getErrorMessage(error, "Unable to reset the password.");

        setAuthError(message);

        throw error;
      }
    },
    [authService],
  );

  const updateProfile = useCallback(
    async (data: { firstName?: string; lastName?: string }) => {
      setAuthError(null);

      try {
        const response = await apiClient.patch<AuthenticatedUser>(
          "/profile",
          data,
        );

        setUser(response.data);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Unable to update your profile.",
        );

        setAuthError(message);
        throw error;
      }
    },
    [apiClient],
  );

  const changePassword = useCallback(
    async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      setAuthError(null);

      try {
        await apiClient.patch<null>("/profile/password", data);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Unable to change your password.",
        );

        setAuthError(message);
        throw error;
      }
    },
    [apiClient],
  );

  const deleteAccount = useCallback(async () => {
    setAuthError(null);

    try {
      await apiClient.delete<null>("/profile");

      // Clear local authentication only after the API confirms deletion.
      tokenStorage.clear();
      setUser(null);
      setAuthError(null);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete your account.");

      setAuthError(message);
      throw error;
    }
  }, [apiClient]);

  useEffect(() => {
    let mounted = true;

    async function restoreAuthentication() {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        if (mounted) {
          setIsLoading(false);
        }

        return;
      }

      try {
        const response = await authService.getCurrentUser();

        if (!mounted) {
          return;
        }

        setUser(response.data);
        setAuthError(null);
      } catch (error) {
        tokenStorage.clear();

        if (!mounted) {
          return;
        }

        setUser(null);
        setAuthError(
          getErrorMessage(error, "Unable to restore authentication."),
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void restoreAuthentication();

    return () => {
      mounted = false;
    };
  }, [authService]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      apiClient,
      isLoading,
      isAuthenticated: user !== null,
      authError,

      updateProfile,
      changePassword,
      deleteAccount,

      refreshUser,

      login,
      register,

      logout,
      logoutAll,

      verifyEmail,
      resendVerificationEmail,

      getSessions,
      revokeSession,
      revokeOtherSessions,

      forgotPassword,
      resetPassword,
    }),
    [
      apiClient,
      user,
      isLoading,
      authError,

      refreshUser,

      login,
      register,

      updateProfile,
      changePassword,
      deleteAccount,

      logout,
      logoutAll,

      verifyEmail,
      resendVerificationEmail,

      getSessions,
      revokeSession,
      revokeOtherSessions,

      forgotPassword,
      resetPassword,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {emailVerification ? (
        <EmailVerificationScreen
          state={emailVerification}
          onContinue={() => setEmailVerification(null)}
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
