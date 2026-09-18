import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  DigitAuthError,
} from "../lib/digit-auth-client.js";

export type OwnershipOptions = {
  param?: string;
  allowAdmin?: boolean;
};

export function requireOwnership(
  options: OwnershipOptions = {},
) {
  const param = options.param ?? "userId";
  const allowAdmin = options.allowAdmin ?? true;

  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (!req.auth) {
      next(
        new DigitAuthError(
          "Authentication Required",
          401,
          "API_ERROR",
        ),
      );
      return;
    }

    const ownerId = req.params[param];

    if (!ownerId || Array.isArray(ownerId)) {
      next(
        new DigitAuthError(
          `Missing route parameter '${param}'`,
          400,
          "API_ERROR",
        ),
      );
      return;
    }

    if (
      allowAdmin &&
      req.auth.user.role === "ADMIN"
    ) {
      next();
      return;
    }

    if (req.auth.user.id !== ownerId) {
      next(
        new DigitAuthError(
          "Forbidden",
          403,
          "API_ERROR",
        ),
      );
      return;
    }

    next();
  };
}

export function requireOwner(
  getOwnerId: (req: Request) => string | undefined,
) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (!req.auth) {
      next(
        new DigitAuthError(
          "Authentication Required",
          401,
          "API_ERROR",
        ),
      );
      return;
    }

    if (req.auth.user.role === "ADMIN") {
      next();
      return;
    }

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      next(
        new DigitAuthError(
          "Owner ID not provided",
          400,
          "API_ERROR",
        ),
      );
      return;
    }

    if (req.auth.user.id !== String(ownerId)) {
      next(
        new DigitAuthError(
          "Forbidden",
          403,
          "API_ERROR",
        ),
      );
      return;
    }

    next();
  };
}
