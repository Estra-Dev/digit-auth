import type {
  AuthenticatedUser,
  AuthSession,
  DigitAuthApiResponse,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
} from "../types/auth.js";

export type DigitAuthClientOptions = {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  timeoutMs?: number;
};

export class DigitAuthError extends Error {
  readonly status: number;
  readonly code: "API_ERROR" | "NETWORK_ERROR" | "INVALID_RESPONSE";

  constructor(message: string, status: number, code: DigitAuthError["code"]) {
    super(message);
    this.name = "DigitAuthError";
    this.status = status;
    this.code = code;
  }
}

function normalizeApiUrl(apiUrl: string): string {
  return apiUrl.replace(/\/+$/, "");
}

function isApiResponse<T>(value: unknown): value is DigitAuthApiResponse<T> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.success === "boolean" &&
    typeof data.message === "string" &&
    "data" in data
  );
}

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.firstName === "string" &&
    typeof user.lastName === "string" &&
    typeof user.role === "string" &&
    typeof user.status === "string" &&
    typeof user.emailVerified === "boolean" &&
    typeof user.failedLoginAttempts === "number"
  );
}

export class DigitAuthClient {
  private readonly apiUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly timeoutMs: number;

  constructor(options: DigitAuthClientOptions) {
    this.apiUrl = normalizeApiUrl(options.apiUrl);
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    accessToken?: string,
  ): Promise<T> {
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");
    headers.set("X-DigitAuth-Client-Id", this.clientId);
    headers.set("X-DigitAuth-Client-Secret", this.clientSecret);

    if (options.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let response: Response;

    try {
      response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new DigitAuthError(
          "DigitAuth API request timed out.",
          504,
          "NETWORK_ERROR",
        );
      }

      throw new DigitAuthError(
        "Unable to connect to the DigitAuth API.",
        503,
        "NETWORK_ERROR",
      );
    }

    let body: unknown = null;

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      try {
        body = await response.json();
      } catch {
        body = null;
      }
    }

    if (!response.ok) {
      let message = "DigitAuth API request failed.";

      if (isApiResponse<unknown>(body)) {
        message = body.message;
      }

      throw new DigitAuthError(message, response.status, "API_ERROR");
    }

    if (!isApiResponse<T>(body)) {
      throw new DigitAuthError(
        "DigitAuth API returned an invalid response.",
        502,
        "INVALID_RESPONSE",
      );
    }

    return body.data;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return this.request<RefreshTokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({
        refreshToken,
      }),
    });
  }

  async logout(refreshToken: string): Promise<null> {
    return this.request<null>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({
        refreshToken,
      }),
    });
  }

  async logoutAll(refreshToken: string): Promise<null> {
    return this.request<null>("/auth/logout-all", {
      method: "POST",
      body: JSON.stringify({
        refreshToken,
      }),
    });
  }

  async verifyEmail(token: string): Promise<null> {
    return this.request<null>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({
        token,
      }),
    });
  }

  async resendVerificationEmail(email: string): Promise<null> {
    return this.request<null>("/auth/resend-verification-email", {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    });
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse | null> {
    return this.request<ForgotPasswordResponse | null>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      },
    );
  }

  async resetPassword(data: ResetPasswordRequest): Promise<null> {
    return this.request<null>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(accessToken: string): Promise<AuthenticatedUser> {
    const user = await this.request<AuthenticatedUser>(
      "/auth/me",
      {
        method: "GET",
      },
      accessToken,
    );

    if (!isAuthenticatedUser(user)) {
      throw new DigitAuthError(
        "DigitAuth API returned an invalid authenticated user.",
        502,
        "INVALID_RESPONSE",
      );
    }

    return user;
  }

  async getSessions(accessToken: string): Promise<AuthSession[]> {
    return this.request<AuthSession[]>(
      "/auth/sessions",
      {
        method: "GET",
      },
      accessToken,
    );
  }

  async revokeSession(accessToken: string, sessionId: string): Promise<null> {
    return this.request<null>(
      `/auth/sessions/${sessionId}`,
      {
        method: "DELETE",
      },
      accessToken,
    );
  }

  async revokeOtherSessions(
    accessToken: string,
    refreshToken: string,
  ): Promise<null> {
    return this.request<null>(
      "/auth/sessions",
      {
        method: "DELETE",
        body: JSON.stringify({
          refreshToken,
        }),
      },
      accessToken,
    );
  }
}

export function createDigitAuthClient(
  options: DigitAuthClientOptions,
): DigitAuthClient {
  return new DigitAuthClient(options);
}
