import type { NextFunction, Request, Response } from "express";

import { DigitAuthError } from "../lib/digit-auth-client.js";

import type { UserRole } from "@digit-auth/core";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new DigitAuthError("Authentication Required", 401, "API_ERROR"));
      return;
    }

    if (!roles.includes(req.auth.user.role)) {
      next(new DigitAuthError("Forbidden", 403, "API_ERROR"));
      return;
    }

    next();
  };
}
