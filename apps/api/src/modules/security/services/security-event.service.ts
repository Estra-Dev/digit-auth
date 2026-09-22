import { Types } from "mongoose";

import { securityEventRepository } from "../repository/security-event.repository.js";
import { SecurityEvent } from "../types/security-event.js";

class SecurityEventService {
  async log(data: {
    applicationId: Types.ObjectId;
    userId: string;
    event: SecurityEvent;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    await securityEventRepository.create({
      applicationId: data.applicationId,
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

  async getUserEvents(applicationId: Types.ObjectId, userId: string) {
    return securityEventRepository.findByUser(
      applicationId,
      new Types.ObjectId(userId),
    );
  }

  async getAllEvents(applicationId: Types.ObjectId) {
    return securityEventRepository.findAll(applicationId);
  }
}

export const securityEventService = new SecurityEventService();
