import { Types } from "mongoose";

import { securityEventRepository } from "../repository/security-event.repository.js";
import { SecurityEvent } from "../types/security-event.js";

class SecurityEventService {
  async log(data: {
    userId: string;
    event: SecurityEvent;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    await securityEventRepository.create({
      userId: new Types.ObjectId(data.userId),

      event: data.event,

      ...(data.ipAddress !== undefined && {
        ipAddress: data.ipAddress,
      }),

      ...(data.userAgent !== undefined && {
        userAgent: data.userAgent,
      }),

      ...(data.metadata !== undefined && {
        metadata: data.metadata,
      }),
    });
  }

  async getUserEvents(userId: string) {
    return securityEventRepository.findByUser(new Types.ObjectId(userId));
  }

  async getAllEvents() {
    return securityEventRepository.findAll();
  }
}

export const securityEventService = new SecurityEventService();
