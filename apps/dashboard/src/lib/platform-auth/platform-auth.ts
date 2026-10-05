import type {
  PlatformAccount,
  PlatformApplication,
  PlatformApplicationCredentials,
  PlatformLoginResponse,
  PlatformRefreshResponse,
  PlatformSession,
  PlatformUser,
  PlatformApplicationSession,
} from "@/types/platform-auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const PLATFORM_ACCESS_TOKEN_KEY = "platform_access_token";
const PLATFORM_REFRESH_TOKEN_KEY = "platform_refresh_token";

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(PLATFORM_ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(PLATFORM_REFRESH_TOKEN_KEY);
}

function setTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem(PLATFORM_ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(PLATFORM_REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
  sessionStorage.removeItem(PLATFORM_ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(PLATFORM_REFRESH_TOKEN_KEY);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getAccessToken()
        ? {
            Authorization: `Bearer ${getAccessToken()}`,
          }
        : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message ?? "Platform request failed.");
  }

  return body;
}

export async function platformLogin(
  email: string,
  password: string,
): Promise<PlatformLoginResponse> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformLoginResponse;
  }>("/platform/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  setTokens(response.data.accessToken, response.data.refreshToken);

  return response.data;
}
export async function resendPlatformVerificationEmail(
  email: string,
): Promise<void> {
  await request<{
    success: boolean;
    message: string;
    data: null;
  }>("/platform/auth/resend-verification-email", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
}

export async function platformForgotPassword(email: string): Promise<void> {
  await request<{
    success: boolean;
    message: string;
    data: null;
  }>("/platform/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
}

export async function platformResetPassword(
  token: string,
  password: string,
): Promise<void> {
  await request<{
    success: boolean;
    message: string;
    data: null;
  }>("/platform/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token,
      password,
    }),
  });
}

export async function platformRegister(
  email: string,
  password: string,
): Promise<{
  account: {
    id: string;
    email: string;
    emailVerified: boolean;
    status: string;
    createdAt: string;
  };
  workspace: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}> {
  const response = await request<{
    success: boolean;
    message: string;
    data: {
      account: {
        id: string;
        email: string;
        emailVerified: boolean;
        status: string;
        createdAt: string;
      };
      workspace: {
        id: string;
        name: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      };
    };
  }>("/platform/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return response.data;
}

export async function platformRefreshToken(): Promise<PlatformRefreshResponse> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No platform refresh token available.");
  }

  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformRefreshResponse;
  }>("/platform/auth/refresh", {
    method: "POST",
    body: JSON.stringify({
      refreshToken,
    }),
  });

  setTokens(response.data.accessToken, response.data.refreshToken);

  return response.data;
}

export async function getPlatformAccount(): Promise<PlatformAccount> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformAccount;
  }>("/platform/auth/me");

  return response.data;
}

export async function getCurrentWorkspace(): Promise<{
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}> {
  const response = await request<{
    success: boolean;
    message: string;
    data: {
      workspace: {
        id: string;
        name: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      };
    };
  }>("/workspace/me");

  return response.data.workspace;
}

export async function getPlatformSessions(): Promise<PlatformSession[]> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformSession[];
  }>("/platform/auth/sessions");

  return response.data;
}

export async function getPlatformApplicationSessions(): Promise<
  PlatformApplicationSession[]
> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformApplicationSession[];
  }>("/platform/sessions");

  return response.data;
}

export async function getPlatformApplications(): Promise<
  PlatformApplication[]
> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformApplication[];
  }>("/platform/applications");

  return response.data;
}

export async function getPlatformUsers(): Promise<PlatformUser[]> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformUser[];
  }>("/platform/users");

  return response.data;
}

export async function getPlatformUser(userId: string): Promise<PlatformUser> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformUser;
  }>(`/platform/users/${userId}`);

  return response.data;
}

export async function createPlatformApplication(name: string): Promise<{
  application: PlatformApplication;
  credentials: PlatformApplicationCredentials;
}> {
  const response = await request<{
    success: boolean;
    message: string;
    data: {
      application: PlatformApplication;
      credentials: PlatformApplicationCredentials;
    };
  }>("/platform/applications", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  return response.data;
}

export async function getPlatformApplication(
  applicationId: string,
): Promise<PlatformApplication> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformApplication;
  }>(`/platform/applications/${applicationId}`);

  return response.data;
}

export async function suspendPlatformApplication(
  applicationId: string,
): Promise<PlatformApplication> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformApplication;
  }>(`/platform/applications/${applicationId}/suspend`, {
    method: "PATCH",
  });

  return response.data;
}

export async function activatePlatformApplication(
  applicationId: string,
): Promise<PlatformApplication> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformApplication;
  }>(`/platform/applications/${applicationId}/activate`, {
    method: "PATCH",
  });

  return response.data;
}

export async function rotatePlatformApplicationSecret(
  applicationId: string,
): Promise<{
  application: PlatformApplication;
  credentials: PlatformApplicationCredentials;
}> {
  const response = await request<{
    success: boolean;
    message: string;
    data: {
      application: PlatformApplication;
      credentials: PlatformApplicationCredentials;
    };
  }>(`/platform/applications/${applicationId}/rotate-secret`, {
    method: "POST",
  });

  return response.data;
}

export async function platformLogout(): Promise<void> {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await request("/platform/auth/logout", {
        method: "POST",
        body: JSON.stringify({
          refreshToken,
        }),
      });
    }
  } finally {
    clearTokens();
  }
}

export async function platformLogoutAll(): Promise<void> {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await request("/platform/auth/logout-all", {
        method: "POST",
        body: JSON.stringify({
          refreshToken,
        }),
      });
    }
  } finally {
    clearTokens();
  }
}

export async function verifyPlatformEmail(token: string): Promise<{
  account: {
    id: string;
    email: string;
    emailVerified: boolean;
    status: string;
  };
}> {
  const response = await request<{
    success: boolean;
    message: string;
    data: {
      account: {
        id: string;
        email: string;
        emailVerified: boolean;
        status: string;
      };
    };
  }>("/platform/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({
      token,
    }),
  });

  return response.data;
}

export async function changePlatformPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await request<{
    success: boolean;
    message: string;
    data: null;
  }>("/platform/auth/password", {
    method: "PATCH",
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  clearTokens();
}

export function clearPlatformAuth() {
  clearTokens();
}

export function hasPlatformSession(): boolean {
  return Boolean(getRefreshToken());
}
