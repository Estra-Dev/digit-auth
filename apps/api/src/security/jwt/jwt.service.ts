import { jwtVerify, SignJWT } from "jose";
import { config } from "../../config/index.js";
import { jwtPayloadSchema, type JwtPayload } from "./jwt.schema.js";

const encoder = new TextEncoder();

const accessSecret = encoder.encode(config.JWT_ACCESS_SECRET);

const refreshSecret = encoder.encode(config.JWT_REFRESH_SECRET);

export class JwtService {
  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime(config.JWT_ACCESS_EXPIRES_IN)
      .sign(accessSecret);
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime(config.JWT_REFRESH_EXPIRES_IN)
      .sign(refreshSecret);
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, accessSecret);

    return jwtPayloadSchema.parse(payload);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, refreshSecret);

    return jwtPayloadSchema.parse(payload);
  }
}

export const jwtService = new JwtService();
