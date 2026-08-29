import type { Request, Response, NextFunction } from "express";

import { AppError } from "../core/errors/AppError.js";
import { UserRole } from "./roles.js";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication Required", 401, true);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError("Forbidden", 403, true);
    }

    next();
  };
}
