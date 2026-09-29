import { AppError } from "../../../core/errors/AppError.js";
import { UserMapper } from "../../auth/mapper/user.mapper.js";
import type { UserDocument } from "../../auth/model/user.model.js";
import {
  platformUserRepository,
} from "../repository/platform-user.repository.js";

type PopulatedApplication = {
  _id: {
    toString(): string;
  };
  name: string;
  clientId: string;
  status: string;
};

function mapPlatformUser(user: UserDocument) {
  const response = UserMapper.toResponse(user);

  const application =
    user.applicationId as unknown as PopulatedApplication;

  return {
    ...response,
    application: application
      ? {
          id: application._id.toString(),
          name: application.name,
          clientId: application.clientId,
          status: application.status,
        }
      : null,
  };
}

export class PlatformUserService {
  async listUsers() {
    const users =
      await platformUserRepository.findAll();

    return users.map((user) =>
      mapPlatformUser(user),
    );
  }

  async getUser(userId: string) {
    const user =
      await platformUserRepository.findById(userId);

    if (!user) {
      throw new AppError(
        "User not found.",
        404,
        true,
      );
    }

    return mapPlatformUser(user);
  }
}

export const platformUserService =
  new PlatformUserService();
