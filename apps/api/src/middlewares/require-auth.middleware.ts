import type { NextFunction, Request, Response } from "express";
import { AppError } from "../core/errors/AppError.js";
import { jwtService } from "../security/index.js";
import { userRepository } from "../modules/auth/repositories/user.repository.js";
import { UserStatus } from "../modules/auth/model/user.model.js";
import { UserMapper } from "../modules/auth/mapper/user.mapper.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError("Authentication Required", 401, true);
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Invalid authorization header.", 401, true);
  }

  const payload = await jwtService.verifyAccessToken(token);

  const user = await userRepository.findById(payload.sub);

  if (!user) {
    throw new AppError("User not found", 404, true);
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError("Account is inactive", 403, true);
  }

  req.user = UserMapper.toAuthenticatedUser(user);

  next();
}
