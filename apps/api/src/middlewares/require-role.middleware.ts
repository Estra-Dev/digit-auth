import type { NextFunction, Request, Response } from "express";
import { AppError } from "../core/errors/AppError.js";
import type { UserRole } from "../authorization/roles.js";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401, true);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action.",
        403,
        true,
      );
    }

    next();
  };
}
