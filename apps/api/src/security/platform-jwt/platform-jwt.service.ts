import { jwtVerify, SignJWT } from "jose";
import { config } from "../../config/index.js";
import crypto from "node:crypto";

import {
  platformJwtPayloadSchema,
  type PlatformJwtPayload,
} from "./platform-jwt.schema.js";

const encoder = new TextEncoder();

const platformAccessSecret = encoder.encode(config.JWT_ACCESS_SECRET);

const platformRefreshSecret = encoder.encode(config.JWT_REFRESH_SECRET);

export class PlatformJwtService {
  async generateAccessToken(payload: PlatformJwtPayload): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime(config.JWT_ACCESS_EXPIRES_IN)
      .sign(platformAccessSecret);
  }

  async generateRefreshToken(payload: PlatformJwtPayload): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({
        alg: "HS256",
      })
      .setJti(crypto.randomUUID())
      .setIssuedAt()
      .setExpirationTime(config.JWT_REFRESH_EXPIRES_IN)
      .sign(platformRefreshSecret);
  }

  async verifyAccessToken(token: string): Promise<PlatformJwtPayload> {
    const { payload } = await jwtVerify(token, platformAccessSecret);

    return platformJwtPayloadSchema.parse(payload);
  }

  async verifyRefreshToken(token: string): Promise<PlatformJwtPayload> {
    const { payload } = await jwtVerify(token, platformRefreshSecret);

    return platformJwtPayloadSchema.parse(payload);
  }
}

export const platformJwtService = new PlatformJwtService();
