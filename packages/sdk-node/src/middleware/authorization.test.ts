import type { NextFunction, Request, Response } from "express";

import { afterEach, describe, expect, it, vi } from "vitest";

import { Permission, UserRole } from "@digit-auth/core";

import type { DigitAuth } from "../lib/digit-auth.js";
import { DigitAuthError } from "../lib/digit-auth-client.js";
import type { AuthenticatedRequest, AuthenticatedUser } from "../types/auth.js";

import { getAuth, requireAuth } from "./require-auth.js";
import { requireRole } from "./require-role.js";
import { requirePermission } from "./require-permission.js";
import { requireOwner, requireOwnership } from "./require-ownership.js";

const testUser: AuthenticatedUser = {
  id: "user-123",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  role: UserRole.USER,
  status: "ACTIVE",
  emailVerified: true,
  failedLoginAttempts: 0,
  lockedUntil: null,
};

const adminUser: AuthenticatedUser = {
  ...testUser,
  id: "admin-123",
  email: "admin@example.com",
  role: UserRole.ADMIN,
};

function createRequest(
  options: {
    user?: AuthenticatedUser;
    authorization?: string;
    params?: Record<string, string>;
  } = {},
): Request {
  const request = {
    headers: {
      ...(options.authorization
        ? { authorization: options.authorization }
        : {}),
    },
    params: options.params ?? {},
  } as unknown as Request;

  if (options.user) {
    Object.defineProperty(request, "auth", {
      value: {
        user: options.user,
        accessToken: "test-access-token",
      } satisfies AuthenticatedRequest,
      writable: true,
      configurable: true,
    });
  }

  return request;
}

function createResponse(): Response {
  return {} as Response;
}

type NextMock = NextFunction & ReturnType<typeof vi.fn>;

function createNext(): NextMock {
  return vi.fn((_error?: unknown) => undefined) as NextMock;
}

function expectForbidden(next: ReturnType<typeof createNext>) {
  expect(next).toHaveBeenCalledOnce();

  const error = next.mock.calls[0]?.[0];

  expect(error).toBeInstanceOf(DigitAuthError);
  expect(error).toMatchObject({
    status: 403,
    code: "API_ERROR",
    message: "Forbidden",
  });
}

function expectUnauthenticated(next: ReturnType<typeof createNext>) {
  expect(next).toHaveBeenCalledOnce();

  const error = next.mock.calls[0]?.[0];

  expect(error).toBeInstanceOf(DigitAuthError);
  expect(error).toMatchObject({
    status: 401,
    code: "API_ERROR",
    message: "Authentication Required",
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("requireAuth", () => {
  it("rejects a request without a bearer token", async () => {
    const getCurrentUser = vi.fn();
    const auth = {
      client: { getCurrentUser },
    } as unknown as DigitAuth;

    const request = createRequest();
    const next = createNext();

    await requireAuth(auth)(request, createResponse(), next);

    expectUnauthenticated(next);
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("rejects an incorrectly formatted authorization header", async () => {
    const getCurrentUser = vi.fn();
    const auth = {
      client: { getCurrentUser },
    } as unknown as DigitAuth;

    const request = createRequest({
      authorization: "Basic some-token",
    });
    const next = createNext();

    await requireAuth(auth)(request, createResponse(), next);

    expectUnauthenticated(next);
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("loads the user and attaches an authentication context", async () => {
    const getCurrentUser = vi.fn().mockResolvedValue(testUser);
    const auth = {
      client: { getCurrentUser },
    } as unknown as DigitAuth;

    const request = createRequest({
      authorization: "Bearer valid-access-token",
    });
    const next = createNext();

    await requireAuth(auth)(request, createResponse(), next);

    expect(getCurrentUser).toHaveBeenCalledWith("valid-access-token");
    expect(request.auth).toEqual({
      user: testUser,
      accessToken: "valid-access-token",
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("passes API authentication errors to Express", async () => {
    const apiError = new DigitAuthError(
      "Invalid or expired access token.",
      401,
      "API_ERROR",
    );

    const getCurrentUser = vi.fn().mockRejectedValue(apiError);
    const auth = {
      client: { getCurrentUser },
    } as unknown as DigitAuth;

    const request = createRequest({
      authorization: "Bearer expired-token",
    });
    const next = createNext();

    await requireAuth(auth)(request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(apiError);
  });
});

describe("getAuth", () => {
  it("returns the authentication context when present", () => {
    const request = createRequest({
      user: testUser,
    });

    expect(getAuth(request)).toEqual({
      user: testUser,
      accessToken: "test-access-token",
    });
  });

  it("returns null when the request is unauthenticated", () => {
    expect(getAuth(createRequest())).toBeNull();
  });
});

describe("requireRole", () => {
  it("allows a user with an explicitly permitted role", () => {
    const request = createRequest({
      user: testUser,
    });
    const next = createNext();

    requireRole(UserRole.USER)(request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("allows one of several permitted roles", () => {
    const request = createRequest({
      user: adminUser,
    });
    const next = createNext();

    requireRole(UserRole.USER, UserRole.ADMIN)(request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a user whose role is not permitted", () => {
    const request = createRequest({
      user: testUser,
    });
    const next = createNext();

    requireRole(UserRole.ADMIN)(request, createResponse(), next);

    expectForbidden(next);
  });

  it("rejects an unauthenticated request", () => {
    const request = createRequest();
    const next = createNext();

    requireRole(UserRole.ADMIN)(request, createResponse(), next);

    expectUnauthenticated(next);
  });
});

describe("requirePermission", () => {
  it("allows a USER to read their profile", () => {
    const request = createRequest({
      user: testUser,
    });
    const next = createNext();

    requirePermission(Permission.PROFILE_READ)(request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("allows a USER to update their profile", () => {
    const request = createRequest({
      user: testUser,
    });
    const next = createNext();

    requirePermission(Permission.PROFILE_UPDATE)(
      request,
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a USER who lacks user-management permission", () => {
    const request = createRequest({
      user: testUser,
    });
    const next = createNext();

    requirePermission(Permission.USER_READ)(request, createResponse(), next);

    expectForbidden(next);
  });

  it("allows an ADMIN to use an admin permission", () => {
    const request = createRequest({
      user: adminUser,
    });
    const next = createNext();

    requirePermission(Permission.USER_READ)(request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects an unauthenticated request", () => {
    const request = createRequest();
    const next = createNext();

    requirePermission(Permission.PROFILE_READ)(request, createResponse(), next);

    expectUnauthenticated(next);
  });
});

describe("requireOwnership", () => {
  it("allows a user to access their own resource", () => {
    const request = createRequest({
      user: testUser,
      params: {
        userId: testUser.id,
      },
    });
    const next = createNext();

    requireOwnership()(request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects access to another user's resource", () => {
    const request = createRequest({
      user: testUser,
      params: {
        userId: "another-user-456",
      },
    });
    const next = createNext();

    requireOwnership()(request, createResponse(), next);

    expectForbidden(next);
  });

  it("allows an ADMIN to access another user's resource by default", () => {
    const request = createRequest({
      user: adminUser,
      params: {
        userId: "another-user-456",
      },
    });
    const next = createNext();

    requireOwnership()(request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("can disable the ADMIN ownership bypass", () => {
    const request = createRequest({
      user: adminUser,
      params: {
        userId: "another-user-456",
      },
    });
    const next = createNext();

    requireOwnership({
      allowAdmin: false,
    })(request, createResponse(), next);

    expectForbidden(next);
  });

  it("supports a custom route parameter name", () => {
    const request = createRequest({
      user: testUser,
      params: {
        accountOwnerId: testUser.id,
      },
    });
    const next = createNext();

    requireOwnership({
      param: "accountOwnerId",
    })(request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a missing owner route parameter", () => {
    const request = createRequest({
      user: testUser,
    });
    const next = createNext();

    requireOwnership()(request, createResponse(), next);

    expect(next).toHaveBeenCalledOnce();

    expect(next.mock.calls[0]?.[0]).toMatchObject({
      status: 400,
      message: "Missing route parameter 'userId'",
    });
  });

  it("rejects an unauthenticated request", () => {
    const request = createRequest({
      params: {
        userId: testUser.id,
      },
    });
    const next = createNext();

    requireOwnership()(request, createResponse(), next);

    expectUnauthenticated(next);
  });
});

describe("requireOwner", () => {
  it("allows access when the resolved owner is the current user", () => {
    const request = createRequest({
      user: testUser,
    });
    const next = createNext();

    requireOwner(() => testUser.id)(request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects access when the resolved owner is another user", () => {
    const request = createRequest({
      user: testUser,
    });
    const next = createNext();

    requireOwner(() => "another-user-456")(request, createResponse(), next);

    expectForbidden(next);
  });

  it("allows an ADMIN to access another user's resource", () => {
    const request = createRequest({
      user: adminUser,
    });
    const next = createNext();

    requireOwner(() => "another-user-456")(request, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a missing owner ID", () => {
    const request = createRequest({
      user: testUser,
    });
    const next = createNext();

    requireOwner(() => undefined)(request, createResponse(), next);

    expect(next).toHaveBeenCalledOnce();

    expect(next.mock.calls[0]?.[0]).toMatchObject({
      status: 400,
      message: "Owner ID not provided",
    });
  });

  it("rejects an unauthenticated request", () => {
    const request = createRequest();
    const next = createNext();

    requireOwner(() => testUser.id)(request, createResponse(), next);

    expectUnauthenticated(next);
  });
});
