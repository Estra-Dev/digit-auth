import type { NextFunction, Request, Response } from "express";

import { Permission, RolePermissions } from "@digit-auth/core";

import { DigitAuthError } from "../lib/digit-auth-client.js";

export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new DigitAuthError("Authentication Required", 401, "API_ERROR"));
      return;
    }

    const permissions = RolePermissions[req.auth.user.role];

    if (!permissions?.includes(permission)) {
      next(new DigitAuthError("Forbidden", 403, "API_ERROR"));
      return;
    }

    next();
  };
}
