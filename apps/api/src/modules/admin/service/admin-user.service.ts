import { AppError } from "../../../core/errors/AppError.js";

import { userRepository } from "../../auth/repositories/user.repository.js";
import { UserMapper } from "../../auth/mapper/user.mapper.js";

class AdminUserService {
  async getUser(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, true);
    }

    return UserMapper.toResponse(user);
  }

  async listUsers() {
    const users = await userRepository.findAll();

    return users.map((user) => UserMapper.toResponse(user));
  }

  async updateUser(
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

    const user = await userRepository.updateById(userId, update);

    if (!user) {
      throw new AppError("User not found", 404, true);
    }

    return UserMapper.toResponse(user);
  }

  async deleteUser(userId: string) {
    const user = await userRepository.deleteById(userId);

    if (!user) {
      throw new AppError("User not found", 404, true);
    }
  }
}

export const adminUserService = new AdminUserService();
