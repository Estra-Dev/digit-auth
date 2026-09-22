import { Types } from "mongoose";

import { auditRepository } from "../repository/audit.repository.js";
import { AuditEvent } from "../types/audit-event.js";

class AuditService {
  async log(data: {
    applicationId: Types.ObjectId;
    userId: string;
    event: AuditEvent;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    await auditRepository.create({
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

  async getAllLogs(applicationId: Types.ObjectId) {
    return auditRepository.findAll(applicationId);
  }
}

export const auditService = new AuditService();
