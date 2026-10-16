import mongoose, { Types } from "mongoose";

import { AppError } from "../../../core/errors/AppError.js";

import { UserMapper } from "../../auth/mapper/user.mapper.js";
import { passwordResetTokenRepository } from "../../auth/repositories/password-reset-token.repository.js";
import { sessionRepository } from "../../auth/repositories/session.repository.js";
import { verificationTokenRepository } from "../../auth/repositories/verification-token.repository.js";

import { profileRepository } from "../repository/profile.repository.js";

import type { ChangePasswordInput } from "../validators/change-password.schema.js";
import { passwordService } from "../../../security/index.js";

class ProfileService {
  async updateProfile(
    applicationId: Types.ObjectId,
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
    },
  ) {
    const update: {
      firstName?: string;
      lastName?: string;
    } = {};

    if (data.firstName !== undefined) {
      update.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      update.lastName = data.lastName;
    }

    const user = await profileRepository.updateById(
      applicationId,
      userId,
      update,
    );

    if (!user) {
      throw new AppError("User not found", 404, true);
    }

    return UserMapper.toResponse(user);
  }

  async changePassword(
    applicationId: Types.ObjectId,
    userId: string,
    data: ChangePasswordInput,
  ) {
    const user = await profileRepository.findById(applicationId, userId);

    if (!user) {
      throw new AppError("User not found", 404, true);
    }

    const validPassword = await passwordService.verify(
      user.passwordHashed,
      data.currentPassword,
    );

    if (!validPassword) {
      throw new AppError("Current password is incorrect", 401, true);
    }

    const passwordHashed = await passwordService.hash(data.newPassword);

    await profileRepository.updatePassword(
      applicationId,
      userId,
      passwordHashed,
    );
  }

  async deleteAccount(applicationId: Types.ObjectId, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("User not found", 404, true);
    }

    const userObjectId = new Types.ObjectId(userId);
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const user = await profileRepository.deleteById(
        applicationId,
        userObjectId,
        session,
      );

      if (!user) {
        throw new AppError("User not found", 404, true);
      }

      await sessionRepository.deleteByUserId(
        applicationId,
        userObjectId,
        session,
      );

      await verificationTokenRepository.deleteByUserId(
        applicationId,
        userObjectId,
        session,
      );

      await passwordResetTokenRepository.deleteByUserId(
        applicationId,
        userObjectId,
        session,
      );

      await session.commitTransaction();
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }
}

export const profileService = new ProfileService();
