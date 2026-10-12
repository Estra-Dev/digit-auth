import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient, ApiError, createApiClient } from "../src/lib/api-client";
import { tokenStorage } from "../src/lib/auth/token-storage";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function apiResponse<T>(data: T) {
  return {
    success: true,
    message: "Success",
    data,
  };
}

describe("ApiClient", () => {
  beforeEach(() => {
    tokenStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    tokenStorage.clear();
    vi.unstubAllGlobals();
  });

  it("requires a non-empty publishable key", () => {
    expect(
      () =>
        new ApiClient({
          publishableKey: "   ",
        }),
    ).toThrow("DigitAuth publishableKey is required.");
  });

  it("sends the publishable key and includes credentials", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      jsonResponse(apiResponse({ id: "user-1" })),
    );

    const client = createApiClient({
      baseUrl: "https://example.com/api/v1/",
      publishableKey: "pk_test_example",
    });

    const result = await client.get<{ id: string }>("/browser/auth/me");

    expect(result.data.id).toBe("user-1");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0]!;

    expect(url).toBe("https://example.com/api/v1/browser/auth/me");
    expect(options?.credentials).toBe("include");

    const headers = new Headers(options?.headers);

    expect(headers.get("X-DigitAuth-Publishable-Key")).toBe("pk_test_example");
  });

  it("includes the stored access token in authenticated requests", async () => {
    tokenStorage.setAccessToken("access-token-1");

    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      jsonResponse(apiResponse({ id: "user-1" })),
    );

    const client = createApiClient({
      publishableKey: "pk_test_example",
    });

    await client.get("/browser/auth/me");

    const [, options] = fetchMock.mock.calls[0]!;

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe("Bearer access-token-1");
  });

  it("refreshes expired credentials and retries the original request", async () => {
    tokenStorage.setAccessToken("expired-access");
    tokenStorage.setRefreshToken("refresh-token-1");

    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: false,
            message: "Unauthorized",
            data: null,
          },
          401,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          apiResponse({
            accessToken: "access-token-2",
            refreshToken: "refresh-token-2",
          }),
        ),
      )
      .mockResolvedValueOnce(jsonResponse(apiResponse({ id: "user-1" })));

    const client = createApiClient({
      baseUrl: "https://example.com/api/v1",
      publishableKey: "pk_test_example",
    });

    const result = await client.get<{ id: string }>("/browser/auth/me");

    expect(result.data.id).toBe("user-1");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    expect(tokenStorage.getAccessToken()).toBe("access-token-2");
    expect(tokenStorage.getRefreshToken()).toBe("refresh-token-2");

    const [refreshUrl, refreshOptions] = fetchMock.mock.calls[1]!;

    expect(refreshUrl).toBe("https://example.com/api/v1/browser/auth/refresh");
    expect(refreshOptions?.method).toBe("POST");
    expect(refreshOptions?.credentials).toBe("include");
    expect(refreshOptions?.body).toBe(
      JSON.stringify({ refreshToken: "refresh-token-1" }),
    );

    const [, retryOptions] = fetchMock.mock.calls[2]!;

    const retryHeaders = new Headers(retryOptions?.headers);

    expect(retryHeaders.get("Authorization")).toBe("Bearer access-token-2");
  });

  it("clears stored tokens when refreshing fails", async () => {
    tokenStorage.setAccessToken("expired-access");
    tokenStorage.setRefreshToken("invalid-refresh");

    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: false,
            message: "Unauthorized",
            data: null,
          },
          401,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: false,
            message: "Refresh token is invalid",
            data: null,
          },
          401,
        ),
      );

    const client = createApiClient({
      publishableKey: "pk_test_example",
    });

    await expect(client.get("/browser/auth/me")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Unauthorized",
    });

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws ApiError for unsuccessful HTTP responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          message: "Invalid credentials",
          data: null,
        },
        400,
      ),
    );

    const client = createApiClient({
      publishableKey: "pk_test_example",
    });

    try {
      await client.post("/browser/auth/login", {
        email: "user@example.com",
        password: "wrong-password",
      });

      throw new Error("Expected request to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        status: 400,
        message: "Invalid credentials",
      });
    }
  });
});
