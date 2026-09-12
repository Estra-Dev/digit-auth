"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createApiClient } from "../api-client";
import { createAuthService } from "./auth.service";
import { tokenStorage } from "./token-storage";

import type {
  AuthenticatedUser,
  AuthSession,
  ForgotPasswordResponse,
  ResetPasswordRequest,
} from "../../types/auth";

type AuthContextValue = {
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
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export type AuthProviderProps = {
  children: ReactNode;
  apiUrl?: string;
};

export function AuthProvider({ children, apiUrl }: AuthProviderProps) {
  const apiClient = useMemo(
    () => createApiClient(apiUrl !== undefined ? { baseUrl: apiUrl } : {}),
    [apiUrl],
  );

  const authService = useMemo(() => createAuthService(apiClient), [apiClient]);

  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [authError, setAuthError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();

      setUser(response.data);
      setAuthError(null);
    } catch (error) {
      setUser(null);

      setAuthError(
        error instanceof Error
          ? error.message
          : "Unable to load the current user.",
      );
    }
  }, [authService]);

  const login = useCallback(
    async (data: { email: string; password: string }) => {
      setAuthError(null);

      const response = await authService.login(data);

      tokenStorage.setAccessToken(response.data.accessToken);

      tokenStorage.setRefreshToken(response.data.refreshToken);

      setUser(response.data.user);
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

      await authService.register(data);
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
      await authService.verifyEmail(token);
      await refreshUser();
    },
    [authService, refreshUser],
  );

  const resendVerificationEmail = useCallback(
    async (email: string) => {
      await authService.resendVerificationEmail(email);
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
      const response = await authService.forgotPassword(email);

      return response.data;
    },
    [authService],
  );

  const resetPassword = useCallback(
    async (data: ResetPasswordRequest) => {
      await authService.resetPassword(data);
    },
    [authService],
  );

  useEffect(() => {
    let mounted = true;

    async function restoreAuthentication() {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        // The ApiClient automatically refreshes the access token
        // if the current access token is expired or missing.
        const userResponse = await authService.getCurrentUser();

        if (mounted) {
          setUser(userResponse.data);
          setAuthError(null);
        }
      } catch (error) {
        tokenStorage.clear();

        if (mounted) {
          setUser(null);
          setAuthError(
            error instanceof Error
              ? error.message
              : "Unable to restore authentication.",
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
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
      isLoading,
      isAuthenticated: user !== null,
      authError,

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
      user,
      isLoading,
      authError,

      refreshUser,

      login,
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
