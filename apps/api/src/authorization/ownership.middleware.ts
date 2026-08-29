import type { NextFunction, Request, Response } from "express";

import { AppError } from "../core/errors/AppError.js";
import { UserRole } from "./roles.js";

interface OwnershipOptions {
  /**
   * Route parameter that contains the owner's id.
   * Example:
   * /users/:userId
   */
  param?: string;

  /**
   * Allow admins to bypass ownership.
   */
  allowAdmin?: boolean;
}

export function requireOwnership(options: OwnershipOptions = {}) {
  const { param = "userId", allowAdmin = true } = options;

  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication Required", 401, true);
    }

    const ownerId = req.params[param];

    if (!ownerId) {
      throw new AppError(`Missing route parameter '${param}'`, 400, true);
    }

    if (allowAdmin && req.user.role === UserRole.ADMIN) {
      return next();
    }

    if (req.user.id !== ownerId) {
      throw new AppError("Forbidden", 403, true);
    }

    next();
  };
}
