import type { Request, Response, NextFunction } from "express";

import { AppError } from "../core/errors/AppError.js";
import { UserStatus } from "../modules/auth/model/user.model.js";

export function requireActiveUser(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    throw new AppError("Authentication Required", 401, true);
  }

  if (req.user.status !== UserStatus.ACTIVE) {
    throw new AppError("Account is inactive", 403, true);
  }

  next();
}
