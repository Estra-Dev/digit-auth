import { tokenStorage } from "./auth/token-storage";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export type ApiClientOptions = {
  baseUrl?: string;
};

const DEFAULT_API_URL = "http://localhost:5000/api/v1";

export class ApiClient {
  private readonly baseUrl;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
  ): Promise<ApiResponse<T>> {
    const accessToken = tokenStorage.getAccessToken();

    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json") ?? false;

    const data = isJson ? ((await response.json()) as ApiResponse<T>) : null;

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
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        tokenStorage.clear();
        return false;
      }

      const data = (await response.json()) as ApiResponse<{
        accessToken: string;
        refreshToken: string;
      }>;

      tokenStorage.setAccessToken(data.data.accessToken);
      tokenStorage.setRefreshToken(data.data.refreshToken);

      return true;
    } catch {
      tokenStorage.clear();
      return false;
    }
  }

  async get<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  async post<T>(endpoint: string, body?: unknown) {
    const options: RequestInit = {
      method: "POST",
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, options);
  }

  async put<T>(endpoint: string, body?: unknown) {
    const options: RequestInit = {
      method: "PUT",
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, options);
  }

  async patch<T>(endpoint: string, body?: unknown) {
    const options: RequestInit = {
      method: "PATCH",
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, options);
  }

  async delete<T>(endpoint: string, body?: unknown) {
    const options: RequestInit = {
      method: "DELETE",
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, options);
  }
}

export function createApiClient(options?: ApiClientOptions) {
  return new ApiClient(options);
}

export const apiClient = createApiClient();
