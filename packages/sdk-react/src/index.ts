export { AuthProvider, useAuth } from "./lib/auth/auth-context";

export {
  ApiClient,
  ApiError,
  apiClient,
  createApiClient,
  isApiError,
} from "./lib/api-client";

export { createAuthService } from "./lib/auth/auth.service";

export type { AuthService } from "./lib/auth/auth.service";

export type { ApiClientOptions, ApiResponse } from "./lib/api-client";

export type {
  AuthenticatedUser,
  AuthSession,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
} from "./types/auth";

export { SignedIn } from "./components/signed-in";

export { SignedOut } from "./components/signed-out";

export { ProtectedRoute } from "./components/protected-route";

export { SignOutButton } from "./components/sign-out-button";

export { UserButton } from "./components/user-button";

export type { SignedInProps } from "./components/signed-in";

export type { SignedOutProps } from "./components/signed-out";

export type { ProtectedRouteProps } from "./components/protected-route";

export type { SignOutButtonProps } from "./components/sign-out-button";

export type { UserButtonProps } from "./components/user-button";
