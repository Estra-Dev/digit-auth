import { tokenStorage } from "./auth/token-storage";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, message: string, data: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export type ApiClientOptions = {
  baseUrl?: string;
};

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

const DEFAULT_API_URL = "http://localhost:5000/api/v1";

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function normalizeEndpoint(endpoint: string): string {
  if (!endpoint) {
    return "";
  }

  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

function isTokenResponse(data: unknown): data is TokenResponse {
  if (!data || typeof data !== "object") {
    return false;
  }

  const value = data as Record<string, unknown>;

  return (
    typeof value.accessToken === "string" &&
    value.accessToken.length > 0 &&
    typeof value.refreshToken === "string" &&
    value.refreshToken.length > 0
  );
}

export class ApiClient {
  private readonly baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_API_URL);
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${normalizeEndpoint(endpoint)}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
  ): Promise<ApiResponse<T>> {
    const accessToken = tokenStorage.getAccessToken();

    const headers = new Headers(options.headers);

    if (options.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(this.buildUrl(endpoint), {
      ...options,
      headers,
      credentials: "include",
    });

    if (response.status === 401 && retry) {
      const refreshed = await this.refreshAccessToken();

      if (refreshed) {
        return this.request<T>(endpoint, options, false);
      }
    }

    const data = await this.parseResponse<T>(response);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data?.message ?? "An unexpected error occurred.",
        data,
      );
    }

    if (!data) {
      throw new ApiError(
        response.status,
        "The server returned an invalid response.",
      );
    }

    return data;
  }

  private async parseResponse<T>(
    response: Response,
  ): Promise<ApiResponse<T> | null> {
    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      return null;
    }

    try {
      return (await response.json()) as ApiResponse<T>;
    } catch {
      return null;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(this.buildUrl("/auth/refresh"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ refreshToken }),
      });

      const data = await this.parseResponse<TokenResponse>(response);

      if (!response.ok || !data?.data) {
        tokenStorage.clear();
        return false;
      }

      if (!isTokenResponse(data.data)) {
        tokenStorage.clear();
        return false;
      }

      tokenStorage.setAccessToken(data.data.accessToken);
      tokenStorage.setRefreshToken(data.data.refreshToken);

      return true;
    } catch {
      tokenStorage.clear();
      return false;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: "POST",
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, options);
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: "PUT",
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, options);
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: "PATCH",
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, options);
  }

  async delete<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: "DELETE",
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, options);
  }
}

export function createApiClient(options?: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}

export const apiClient = createApiClient();
