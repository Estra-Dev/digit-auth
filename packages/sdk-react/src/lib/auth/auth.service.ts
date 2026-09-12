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
      return apiClient.post<RegisterResponse>("/auth/register", data);
    },

    async login(data: LoginRequest) {
      return apiClient.post<LoginResponse>("/auth/login", data);
    },

    async getCurrentUser() {
      return apiClient.get<AuthenticatedUser>("/auth/me");
    },

    async refreshToken(refreshToken: string) {
      return apiClient.post<RefreshTokenResponse>("/auth/refresh", {
        refreshToken,
      });
    },

    async logout(refreshToken: string) {
      return apiClient.post<null>("/auth/logout", {
        refreshToken,
      });
    },

    async logoutAll(refreshToken: string) {
      return apiClient.post<null>("/auth/logout-all", {
        refreshToken,
      });
    },

    async verifyEmail(token: string) {
      return apiClient.post<null>("/auth/verify-email", {
        token,
      });
    },

    async resendVerificationEmail(email: string) {
      return apiClient.post<null>("/auth/resend-verification-email", {
        email,
      });
    },

    async getSessions() {
      return apiClient.get<AuthSession[]>("/auth/sessions");
    },

    async revokeSession(sessionId: string) {
      return apiClient.delete<null>(`/auth/sessions/${sessionId}`);
    },

    async revokeOtherSessions(refreshToken: string) {
      return apiClient.delete<null>("/auth/sessions", {
        refreshToken,
      });
    },

    async forgotPassword(email: string) {
      return apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", {
        email,
      });
    },

    async resetPassword(data: ResetPasswordRequest) {
      return apiClient.post<null>("/auth/reset-password", data);
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
