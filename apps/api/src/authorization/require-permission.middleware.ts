import type { NextFunction, Request, Response } from "express";
import type { Permission } from "./permissions.js";
import { AppError } from "../core/errors/AppError.js";
import { RolePermissions } from "./roles.js";

export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication Required", 401, true);
    }

    const permissions = RolePermissions[req.user.role];
    if (!permissions.includes(permission)) {
      throw new AppError("Forbidden", 403, true);
    }
    next();
  };
}
