import { Types } from "mongoose";

import { SecurityEventModel } from "../model/security-event.model.js";
import { SecurityEvent } from "../types/security-event.js";

class SecurityEventRepository {
  async create(data: {
    applicationId: Types.ObjectId;
    userId: Types.ObjectId;
    event: SecurityEvent;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    return SecurityEventModel.create({
      applicationId: data.applicationId,
      userId: data.userId,
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

  async findByUser(applicationId: Types.ObjectId, userId: Types.ObjectId) {
    return SecurityEventModel.find({
      applicationId,
      userId,
    }).sort({
      createdAt: -1,
    });
  }

  async findAll(applicationId: Types.ObjectId) {
    return SecurityEventModel.find({
      applicationId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(500);
  }
}

export const securityEventRepository = new SecurityEventRepository();
