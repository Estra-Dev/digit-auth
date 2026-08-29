import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../core/errors/AppError.js";
import { UserRole } from "../roles.js";

export function requireOwner(getOwnerId: (req: Request) => string | undefined) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication Required", 401, true);
    }

    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      throw new AppError("Owner ID not provided", 400, true);
    }

    if (String(req.user.id) !== String(ownerId)) {
      throw new AppError("Forbidden", 403, true);
    }

    next();
  };
}
