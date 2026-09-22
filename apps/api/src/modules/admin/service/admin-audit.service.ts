import { Types } from "mongoose";

import { auditRepository } from "../../audit/repository/audit.repository.js";

class AdminAuditService {
  async listLogs(applicationId: Types.ObjectId) {
    return auditRepository.findAll(applicationId);
  }
}

export const adminAuditService = new AdminAuditService();
