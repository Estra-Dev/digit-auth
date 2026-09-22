import { Types } from "mongoose";

import { AppError } from "../../../core/errors/AppError.js";
import { securityEventRepository } from "../../security/repository/security-event.repository.js";

class AdminSecurityEventService {
  async listEvents(applicationId: Types.ObjectId) {
    return securityEventRepository.findAll(applicationId);
  }

  async getUserEvents(applicationId: Types.ObjectId, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400, true);
    }

    return securityEventRepository.findByUser(
      applicationId,
      new Types.ObjectId(userId),
    );
  }
}

export const adminSecurityEventService = new AdminSecurityEventService();
