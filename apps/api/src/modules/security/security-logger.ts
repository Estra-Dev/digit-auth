import type { Request } from "express";

import { securityEventService } from "./services/security-event.service.js";
import { SecurityEvent } from "./types/security-event.js";

export class SecurityLogger {
  static async log(
    req: Request,
    userId: string,
    event: SecurityEvent,
    metadata?: Record<string, unknown>,
  ) {
    await securityEventService.log({
      userId,
      event,

      ipAddress: req.ip ?? req.socket.remoteAddress ?? null,

      userAgent: req.get("user-agent") ?? null,

      ...(metadata !== undefined && {
        metadata,
      }),
    });
  }
}
