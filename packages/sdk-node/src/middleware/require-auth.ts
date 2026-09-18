import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type { DigitAuth } from "../lib/digit-auth.js";
import type {
  AuthenticatedRequest,
} from "../types/auth.js";
import {
  DigitAuthError,
} from "../lib/digit-auth-client.js";


declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedRequest;
    }
  }
}

function extractBearerToken(
  authorization: string | undefined,
): string | null {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function requireAuth(auth: DigitAuth) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const token = extractBearerToken(
      req.headers.authorization,
    );

    if (!token) {
      next(
        new DigitAuthError(
          "Authentication Required",
          401,
          "API_ERROR",
        ),
      );
      return;
    }

    try {
      const user = await auth.client.getCurrentUser(token);

      const authContext: AuthenticatedRequest = {
        user,
        accessToken: token,
      };

      Object.defineProperty(req, "auth", {
        value: authContext,
        writable: false,
        enumerable: false,
        configurable: true,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function getAuth(
  req: Request,
): AuthenticatedRequest | null {
  return req.auth ?? null;
}
