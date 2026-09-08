import type { Request } from "express";

import { securityEventService } from "./services/security-event.service.js";
import { SecurityEvent } from "./types/security-event.js";
import { getRequestContext } from "../../shared/http/request-context.js";

export class SecurityLogger {
  static async log(
    req: Request,
    userId: string,
    event: SecurityEvent,
    metadata?: Record<string, unknown>,
  ) {
    const { ipAddress, userAgent } = getRequestContext(req);

    await securityEventService.log({
      userId,
      event,
      ipAddress,
      userAgent,

      ...(metadata !== undefined && {
        metadata,
      }),
    });
  }
}
