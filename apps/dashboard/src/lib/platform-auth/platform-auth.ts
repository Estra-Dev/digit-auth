import type {
  PlatformAccount,
  PlatformApplication,
  PlatformApplicationCredentials,
  PlatformLoginResponse,
  PlatformRefreshResponse,
  PlatformSession,
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

export async function getPlatformSessions(): Promise<PlatformSession[]> {
  const response = await request<{
    success: boolean;
    message: string;
    data: PlatformSession[];
  }>("/platform/auth/sessions");

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

export function clearPlatformAuth() {
  clearTokens();
}

export function hasPlatformSession(): boolean {
  return Boolean(getRefreshToken());
}
