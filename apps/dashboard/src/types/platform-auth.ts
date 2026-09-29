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

export type PlatformUserApplication = {
  id: string;
  name: string;
  clientId: string;
  status: string;
};

export type PlatformUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  application: PlatformUserApplication | null;
};

export type PlatformSessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
};

export type PlatformSessionApplication = {
  id: string;
  name: string;
  clientId: string;
  status: string;
};

export type PlatformApplicationSession = {
  id: string;
  user: PlatformSessionUser;
  application: PlatformSessionApplication;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string;
};
