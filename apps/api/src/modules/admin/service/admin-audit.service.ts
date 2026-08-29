import { auditRepository } from "../../audit/repository/audit.repository.js";

class AdminAuditService {
  async listLogs() {
    return auditRepository.findAll();
  }
}

export const adminAuditService = new AdminAuditService();
