import type { NextFunction, Request, Response } from "express";

import { AppError } from "../core/errors/AppError.js";
import { platformJwtService } from "../security/platform-jwt/platform-jwt.service.js";
import { platformAccountRepository } from "../modules/platform-account/repository/platform-account.repository.js";
import { platformSessionRepository } from "../modules/platform-session/repository/platform-session.repository.js";

declare global {
  namespace Express {
    interface Request {
      platformAccount?: Awaited<
        ReturnType<typeof platformAccountRepository.findById>
      > extends infer T
        ? T extends null
          ? never
          : T
        : never;

      platformSessionId?: string;
    }
  }
}

export async function requirePlatformAuth(
  req: Request,
  _res: Response,
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

  let payload;

  try {
    payload = await platformJwtService.verifyAccessToken(token);
  } catch {
    throw new AppError("Invalid or expired access token.", 401, true);
  }

  if (!payload.sub || !payload.sessionId) {
    throw new AppError("Invalid platform access token.", 401, true);
  }

  const session = await platformSessionRepository.findById(payload.sessionId);

  if (!session) {
    throw new AppError("Platform session is no longer valid.", 401, true);
  }

  if (session.platformAccountId.toString() !== payload.sub) {
    throw new AppError("Invalid authentication context.", 401, true);
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await platformSessionRepository.deleteById(payload.sessionId);

    throw new AppError("Platform session has expired.", 401, true);
  }

  const account = await platformAccountRepository.findById(payload.sub);

  if (!account) {
    throw new AppError("Platform account not found.", 404, true);
  }

  if (account.status !== "ACTIVE") {
    throw new AppError("Platform account is inactive.", 403, true);
  }

  req.platformAccount = account;
  req.platformSessionId = payload.sessionId;

  next();
}
