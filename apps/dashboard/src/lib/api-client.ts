import { tokenStorage } from "@/lib/auth/token-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    this.refreshPromise = (async () => {
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
          tokenStorage.clearRefreshToken();
          this.setAccessToken(null);
          return null;
        }

        const data = (await response.json()) as ApiResponse<{
          accessToken: string;
          refreshToken: string;
        }>;

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        this.setAccessToken(newAccessToken);
        tokenStorage.setRefreshToken(newRefreshToken);

        return newAccessToken;
      } catch {
        tokenStorage.clearRefreshToken();
        this.setAccessToken(null);
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    hasRetried = false,
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken
          ? { Authorization: `Bearer ${this.accessToken}` }
          : {}),
        ...options.headers,
      },
    });

    let data: ApiResponse<T> | undefined;

    try {
      data = (await response.json()) as ApiResponse<T>;
    } catch {
      data = undefined;
    }

    // Handle expired access token BEFORE throwing the 401 error.
    if (response.status === 401 && !hasRetried) {
      const newAccessToken = await this.refreshAccessToken();

      if (newAccessToken) {
        return this.request(
          endpoint,
          {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          },
          true,
        );
      }
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message ?? "An unexpected error occurred.",
        response.status,
        data,
      );
    }

    if (!data) {
      throw new ApiError(
        "The server returned an invalid response.",
        response.status,
      );
    }

    return data;
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
