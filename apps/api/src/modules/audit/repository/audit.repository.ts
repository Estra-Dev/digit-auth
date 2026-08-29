import { AuditLog } from "../model/audit-log.model.js";
import { AuditEvent } from "../types/audit-event.js";
import { Types } from "mongoose";

export class AuditRepository {
  async create(data: {
    userId: Types.ObjectId;
    event: AuditEvent;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    return AuditLog.create(data);
  }

  async findByUserId(userId: Types.ObjectId) {
    return AuditLog.find({ userId }).sort({
      createdAt: -1,
    });
  }

  async findAll() {
    return AuditLog.find()
      .sort({
        createdAt: -1,
      })
      .limit(500);
  }
}

export const auditRepository = new AuditRepository();
