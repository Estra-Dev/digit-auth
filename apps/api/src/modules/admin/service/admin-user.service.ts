import { Types } from "mongoose";

import { AppError } from "../../../core/errors/AppError.js";

import { userRepository } from "../../auth/repositories/user.repository.js";
import { UserMapper } from "../../auth/mapper/user.mapper.js";

class AdminUserService {
  async getUser(applicationId: Types.ObjectId, userId: string) {
    const user = await userRepository.findByIdInApplication(
      applicationId,
      userId,
    );

    if (!user) {
      throw new AppError("User not found", 404, true);
    }

    return UserMapper.toResponse(user);
  }

  async listUsers(applicationId: Types.ObjectId) {
    const users = await userRepository.findAllInApplication(applicationId);

    return users.map((user) => UserMapper.toResponse(user));
  }

  async updateUser(
    applicationId: Types.ObjectId,
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      role?: string;
      status?: string;
    },
  ) {
    const update: Record<string, unknown> = {};

    if (data.firstName !== undefined) {
      update.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      update.lastName = data.lastName;
    }

    if (data.role !== undefined) {
      update.role = data.role;
    }

    if (data.status !== undefined) {
      update.status = data.status;
    }

    const user = await userRepository.updateByIdInApplication(
      applicationId,
      userId,
      update,
    );

    if (!user) {
      throw new AppError("User not found", 404, true);
    }

    return UserMapper.toResponse(user);
  }

  async deleteUser(applicationId: Types.ObjectId, userId: string) {
    const user = await userRepository.deleteByIdInApplication(
      applicationId,
      userId,
    );

    if (!user) {
      throw new AppError("User not found", 404, true);
    }
  }
}

export const adminUserService = new AdminUserService();
