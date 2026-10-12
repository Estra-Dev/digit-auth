import type { ApiClient } from "../api-client";

import type {
  AuthenticatedUser,
  AuthSession,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
} from "../../types/auth";

export function createAuthService(apiClient: ApiClient) {
  return {
    async register(data: RegisterRequest) {
      return apiClient.post<RegisterResponse>("/browser/auth/register", data);
    },

    async login(data: LoginRequest) {
      return apiClient.post<LoginResponse>("/browser/auth/login", data);
    },

    async getCurrentUser() {
      return apiClient.get<AuthenticatedUser>("/browser/auth/me");
    },

    async refreshToken(refreshToken: string) {
      return apiClient.post<RefreshTokenResponse>("/browser/auth/refresh", {
        refreshToken,
      });
    },

    async logout(refreshToken: string) {
      return apiClient.post<null>("/browser/auth/logout", {
        refreshToken,
      });
    },

    async logoutAll(refreshToken: string) {
      return apiClient.post<null>("/browser/auth/logout-all", {
        refreshToken,
      });
    },

    async verifyEmail(token: string) {
      return apiClient.post<null>("/browser/auth/verify-email", {
        token,
      });
    },

    async resendVerificationEmail(email: string) {
      return apiClient.post<null>("/browser/auth/resend-verification-email", {
        email,
      });
    },

    async getSessions() {
      return apiClient.get<AuthSession[]>("/browser/auth/sessions");
    },

    async revokeSession(sessionId: string) {
      return apiClient.delete<null>(`/browser/auth/sessions/${sessionId}`);
    },

    async revokeOtherSessions(refreshToken: string) {
      return apiClient.delete<null>("/browser/auth/sessions", {
        refreshToken,
      });
    },

    async forgotPassword(email: string) {
      return apiClient.post<ForgotPasswordResponse>(
        "/browser/auth/forgot-password",
        {
          email,
        },
      );
    },

    async resetPassword(data: ResetPasswordRequest) {
      return apiClient.post<null>("/browser/auth/reset-password", data);
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
