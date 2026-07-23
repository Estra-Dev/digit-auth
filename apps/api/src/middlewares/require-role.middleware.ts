import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../modules/auth/model/user.model.js";
import { AppError } from "../core/errors/AppError.js";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401, true);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError("Forbidden", 403, true);
    }

    next();
  };
}
