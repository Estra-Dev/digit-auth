export type AuthenticatedUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
};

export type LoginResponse = {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
};

export type RegisterResponse = AuthenticatedUser;

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};
