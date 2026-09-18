import type {
  AuthenticatedUser,
  DigitAuthApiResponse,
} from "../types/auth.js";

export type DigitAuthClientOptions = {
  apiUrl: string;
  timeoutMs?: number;
};

export class DigitAuthError extends Error {
  readonly status: number;
  readonly code: "API_ERROR" | "NETWORK_ERROR" | "INVALID_RESPONSE";

  constructor(
    message: string,
    status: number,
    code: DigitAuthError["code"],
  ) {
    super(message);
    this.name = "DigitAuthError";
    this.status = status;
    this.code = code;
  }
}

function normalizeApiUrl(apiUrl: string): string {
  return apiUrl.replace(/\/+$/, "");
}

function isApiResponse<T>(
  value: unknown,
): value is DigitAuthApiResponse<T> {
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

function isAuthenticatedUser(
  value: unknown,
): value is AuthenticatedUser {
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
  private readonly timeoutMs: number;

  constructor(options: DigitAuthClientOptions) {
    this.apiUrl = normalizeApiUrl(options.apiUrl);
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  async getCurrentUser(
    accessToken: string,
  ): Promise<AuthenticatedUser> {
    let response: Response;

    try {
      response = await fetch(
        `${this.apiUrl}/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(this.timeoutMs),
        },
      );
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

      throw new DigitAuthError(
        message,
        response.status,
        "API_ERROR",
      );
    }

    if (!isApiResponse<unknown>(body)) {
      throw new DigitAuthError(
        "DigitAuth API returned an invalid response.",
        502,
        "INVALID_RESPONSE",
      );
    }

    if (!isAuthenticatedUser(body.data)) {
      throw new DigitAuthError(
        "DigitAuth API returned an invalid authenticated user.",
        502,
        "INVALID_RESPONSE",
      );
    }

    return body.data;
  }
}

export function createDigitAuthClient(
  options: DigitAuthClientOptions,
): DigitAuthClient {
  return new DigitAuthClient(options);
}
