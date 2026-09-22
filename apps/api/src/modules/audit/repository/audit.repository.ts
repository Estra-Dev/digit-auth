import { Types } from "mongoose";

import { AuditLog } from "../model/audit-log.model.js";
import { AuditEvent } from "../types/audit-event.js";

export class AuditRepository {
  async create(data: {
    applicationId: Types.ObjectId;
    userId: Types.ObjectId;
    event: AuditEvent;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    return AuditLog.create({
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

  async findByUserId(applicationId: Types.ObjectId, userId: Types.ObjectId) {
    return AuditLog.find({
      applicationId,
      userId,
    }).sort({
      createdAt: -1,
    });
  }

  async findAll(applicationId: Types.ObjectId) {
    return AuditLog.find({
      applicationId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(500);
  }
}

export const auditRepository = new AuditRepository();
