import { afterEach, describe, expect, it, vi } from "vitest";

import { DigitAuthClient, DigitAuthError } from "./digit-auth-client.js";

describe("DigitAuthClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should attach application credentials to login requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: "Login Successful.",
          data: {
            user: {
              id: "user-123",
              email: "user@example.com",
              firstName: "Test",
              lastName: "User",
              role: "USER",
              status: "ACTIVE",
              emailVerified: true,
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
            accessToken: "access-token",
            refreshToken: "refresh-token",
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const client = new DigitAuthClient({
      apiUrl: "http://localhost:3000/api/v1",
      clientId: "da_test-client",
      clientSecret: "das_test-secret",
    });

    const result = await client.login({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const call = fetchMock.mock.calls[0];

    expect(call).toBeDefined();

    const [url, options] = call!;

    expect(url).toBe("http://localhost:3000/api/v1/auth/login");

    expect(options?.method).toBe("POST");

    const headers = new Headers(options?.headers);

    expect(headers.get("X-DigitAuth-Client-Id")).toBe("da_test-client");

    expect(headers.get("X-DigitAuth-Client-Secret")).toBe("das_test-secret");

    expect(headers.get("Content-Type")).toBe("application/json");

    expect(JSON.parse(String(options?.body))).toEqual({
      email: "user@example.com",
      password: "password123",
    });
  });

  it("should attach application credentials and access token to protected requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: "Current user retrieved successfully.",
          data: {
            id: "user-123",
            email: "user@example.com",
            firstName: "Test",
            lastName: "User",
            role: "USER",
            status: "ACTIVE",
            emailVerified: true,
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const client = new DigitAuthClient({
      apiUrl: "http://localhost:3000/api/v1",
      clientId: "da_test-client",
      clientSecret: "das_test-secret",
    });

    const user = await client.getCurrentUser("access-token");

    expect(user.id).toBe("user-123");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const call = fetchMock.mock.calls[0];

    expect(call).toBeDefined();

    const [url, options] = call!;

    expect(url).toBe("http://localhost:3000/api/v1/auth/me");

    const headers = new Headers(options?.headers);

    expect(headers.get("X-DigitAuth-Client-Id")).toBe("da_test-client");

    expect(headers.get("X-DigitAuth-Client-Secret")).toBe("das_test-secret");

    expect(headers.get("Authorization")).toBe("Bearer access-token");
  });

  it("should convert API failures into DigitAuthError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          message: "Invalid application credentials.",
          data: null,
        }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const client = new DigitAuthClient({
      apiUrl: "http://localhost:3000/api/v1",
      clientId: "invalid-client",
      clientSecret: "invalid-secret",
    });

    await expect(
      client.login({
        email: "user@example.com",
        password: "password123",
      }),
    ).rejects.toMatchObject({
      name: "DigitAuthError",
      status: 401,
      code: "API_ERROR",
      message: "Invalid application credentials.",
    });
  });

  it("should normalize a trailing slash from the API URL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: "Login Successful.",
          data: {
            user: {
              id: "user-123",
              email: "user@example.com",
              firstName: "Test",
              lastName: "User",
              role: "USER",
              status: "ACTIVE",
              emailVerified: true,
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
            accessToken: "access-token",
            refreshToken: "refresh-token",
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const client = new DigitAuthClient({
      apiUrl: "http://localhost:3000/api/v1/",
      clientId: "da_test-client",
      clientSecret: "das_test-secret",
    });

    await client.login({
      email: "user@example.com",
      password: "password123",
    });

    const call = fetchMock.mock.calls[0];

    expect(call).toBeDefined();

    const [url] = call!;

    expect(url).toBe("http://localhost:3000/api/v1/auth/login");
  });

  it("should expose typed API errors", () => {
    const error = new DigitAuthError(
      "Invalid application credentials.",
      401,
      "API_ERROR",
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DigitAuthError);
    expect(error.message).toBe("Invalid application credentials.");
    expect(error.status).toBe(401);
    expect(error.code).toBe("API_ERROR");
  });
});
