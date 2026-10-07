import type { Permission, UserRole } from "@digit-auth/core";

export type { Permission, UserRole };

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export type AuthenticatedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil?: string | null;
};

export type AuthSession = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterResponse = AuthenticatedUser & {
  verificationToken?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type ForgotPasswordResponse = {
  resetToken: string | null;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type AuthenticatedRequest = {
  user: AuthenticatedUser;
  accessToken: string;
};

export type DigitAuthApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
