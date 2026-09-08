import { apiClient } from "../lib/api-client";
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
} from "../types/auth";

export const authService = {
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
};
