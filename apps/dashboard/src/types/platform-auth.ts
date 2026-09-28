export type PlatformAccount = {
  id: string;
  email: string;
  emailVerified: boolean;
  status: string;
  createdAt: string;
};

export type PlatformLoginResponse = {
  account: PlatformAccount;
  accessToken: string;
  refreshToken: string;
};

export type PlatformRefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export type PlatformSession = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
  lastUsedAt: string;
  createdAt: string;
  current: boolean;
};

export type PlatformApplication = {
  id: string;
  name: string;
  clientId: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
};

export type PlatformApplicationCredentials = {
  clientId: string;
  clientSecret: string;
};
