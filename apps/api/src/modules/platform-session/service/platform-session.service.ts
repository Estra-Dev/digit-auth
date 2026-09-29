import { sessionRepository } from "../../auth/repositories/session.repository.js";
import { AppError } from "../../../core/errors/AppError.js";

type PopulatedUser = {
  _id: {
    toString(): string;
  };
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
};

type PopulatedApplication = {
  _id: {
    toString(): string;
  };
  name: string;
  clientId: string;
  status: string;
};

export class PlatformSessionService {
  async listSessions() {
    const sessions = await sessionRepository.findAllWithDetails();

    return sessions.map((session) => {
      const user = session.userId as unknown as PopulatedUser;

      const application =
        session.applicationId as unknown as PopulatedApplication;

      if (!user || !application) {
        throw new AppError("Invalid session relationship.", 500, false);
      }

      return {
        id: session.id,

        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        },

        application: {
          id: application._id.toString(),
          name: application.name,
          clientId: application.clientId,
          status: application.status,
        },

        userAgent: session.userAgent,
        ipAddress: session.ipAddress,

        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        lastUsedAt: session.lastUsedAt,
      };
    });
  }
}

export const platformSessionService = new PlatformSessionService();
