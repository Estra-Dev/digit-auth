import { Types } from "mongoose";

import { AppError } from "../../../core/errors/AppError.js";
import { sessionRepository } from "../../auth/repositories/session.repository.js";
import { userRepository } from "../../auth/repositories/user.repository.js";

class AdminSessionService {
  async getUserSessions(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400, true);
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, true);
    }

    return sessionRepository.findByUserIdWithDetails(
      new Types.ObjectId(userId),
    );
  }

  async revokeUserSession(userId: string, sessionId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400, true);
    }

    if (!Types.ObjectId.isValid(sessionId)) {
      throw new AppError("Invalid session ID", 400, true);
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, true);
    }

    const session = await sessionRepository.findByIdForUser(
      sessionId,
      new Types.ObjectId(userId),
    );

    if (!session) {
      throw new AppError("Session not found", 404, true);
    }

    await sessionRepository.deleteById(sessionId);

    return null;
  }

  async revokeAllUserSessions(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400, true);
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, true);
    }

    await sessionRepository.deleteAllForUser(new Types.ObjectId(userId));

    return null;
  }
}

export const adminSessionService = new AdminSessionService();
