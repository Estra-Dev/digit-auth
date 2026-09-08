"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { authService } from "@/services/auth.service";
import { apiClient } from "@/lib/api-client";
import { tokenStorage } from "@/lib/auth/token-storage";
import type { AuthenticatedUser } from "@/types/auth";

let authInitializationPromise: Promise<void> | null = null;

type AuthContextValue = {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  refreshUser: () => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // const initializationRef = useRef<Promise<void> | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const login = useCallback(
    async (data: { email: string; password: string }) => {
      setAuthError(null);

      const response = await authService.login(data);

      apiClient.setAccessToken(response.data.accessToken);

      tokenStorage.setRefreshToken(response.data.refreshToken);

      setUser(response.data.user);
    },
    [],
  );

  const refreshUser = useCallback(async () => {
    const response = await authService.getCurrentUser();

    setUser(response.data);
  }, []);

  useEffect(() => {
    if (authInitializationPromise) {
      authInitializationPromise.then(() => {
        setIsLoading(false);
      });

      return;
    }

    authInitializationPromise = (async () => {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        return;
      }

      try {
        const response = await authService.refreshToken(refreshToken);

        apiClient.setAccessToken(response.data.accessToken);

        tokenStorage.setRefreshToken(response.data.refreshToken);

        const userResponse = await authService.getCurrentUser();

        setUser(userResponse.data);
      } catch (error) {
        apiClient.setAccessToken(null);
        tokenStorage.clearRefreshToken();
        setUser(null);

        setAuthError(
          error instanceof Error
            ? error.message
            : "Unable to restore your session.",
        );
      }
    })();

    authInitializationPromise.finally(() => {
      setIsLoading(false);
    });
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } finally {
      apiClient.setAccessToken(null);
      tokenStorage.clearRefreshToken();
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await authService.logoutAll(refreshToken);
      }
    } finally {
      apiClient.setAccessToken(null);
      tokenStorage.clearRefreshToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        authError,
        login,
        refreshUser,
        logout,
        logoutAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
