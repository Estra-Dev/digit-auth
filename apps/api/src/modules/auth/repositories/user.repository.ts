import { Types, type ClientSession } from "mongoose";

import { User, type UserDocument } from "../model/user.model.js";

import { withSession } from "../../../shared/utils/mongoose.js";

export class UserRepository {
  // Find a user by email within an application.

  async findByEmail(
    applicationId: Types.ObjectId,
    email: string,
  ): Promise<UserDocument | null> {
    return User.findOne({
      applicationId,
      email: email.toLowerCase(),
    });
  }

  // Find a user by ID.

  async findById(id: string): Promise<UserDocument | null> {
    return User.findById(id);
  }

  // Find a user by ID within an application.

  async findByIdInApplication(
    applicationId: Types.ObjectId,
    userId: string,
  ): Promise<UserDocument | null> {
    return User.findOne({
      _id: userId,
      applicationId,
    });
  }

  // Create a new user.

  async create(
    data: {
      applicationId: Types.ObjectId;
      firstName: string;
      lastName: string;
      email: string;
      passwordHashed: string;
    },
    session?: ClientSession,
  ): Promise<UserDocument> {
    const user = new User({
      ...data,
      email: data.email.toLowerCase(),
    });

    await user.save(withSession(session));

    return user;
  }

  async findEmailWithPassword(
    applicationId: Types.ObjectId,
    email: string,
  ): Promise<UserDocument | null> {
    return User.findOne({
      applicationId,
      email: email.toLowerCase(),
    }).select("+passwordHashed");
  }

  async verifyUser(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<void> {
    await User.findOneAndUpdate(
      {
        _id: userId,
        applicationId,
      },
      {
        emailVerified: true,
      },
      withSession(session),
    );
  }

  async updatePassword(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
    passwordHashed: string,
    session?: ClientSession,
  ): Promise<void> {
    await User.findOneAndUpdate(
      {
        _id: userId,
        applicationId,
      },
      {
        passwordHashed,
      },
      withSession(session),
    );
  }

  async incrementFailedLoginAttempts(
    applicationId: Types.ObjectId,
    userId: string,
  ): Promise<void> {
    await User.findOneAndUpdate(
      {
        _id: userId,
        applicationId,
      },
      {
        $inc: {
          failedLoginAttempts: 1,
        },
      },
    );
  }

  async resetFailedLoginAttempts(
    applicationId: Types.ObjectId,
    userId: string,
  ): Promise<void> {
    await User.findOneAndUpdate(
      {
        _id: userId,
        applicationId,
      },
      {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    );
  }

  async lockAccount(
    applicationId: Types.ObjectId,
    userId: string,
    lockedUntil: Date,
  ): Promise<void> {
    await User.findOneAndUpdate(
      {
        _id: userId,
        applicationId,
      },
      {
        lockedUntil,
      },
    );
  }

  async unlockAccount(
    applicationId: Types.ObjectId,
    userId: string,
  ): Promise<void> {
    await User.findOneAndUpdate(
      {
        _id: userId,
        applicationId,
      },
      {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    );
  }

  async getFailedAttempts(
    applicationId: Types.ObjectId,
    userId: string,
  ): Promise<number> {
    const user = await User.findOne({
      _id: userId,
      applicationId,
    }).select("failedLoginAttempts");

    return user?.failedLoginAttempts ?? 0;
  }

  async updateProfile(
    applicationId: Types.ObjectId,
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
    },
  ) {
    return User.findOneAndUpdate(
      {
        _id: userId,
        applicationId,
      },
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  // Find all users within an application.

  async findAllInApplication(applicationId: Types.ObjectId) {
    return User.find({
      applicationId,
    }).sort({
      createdAt: -1,
    });
  }

  // Update a user only if they belong to the application.

  async updateByIdInApplication(
    applicationId: Types.ObjectId,
    userId: string,
    data: Record<string, unknown>,
  ) {
    return User.findOneAndUpdate(
      {
        _id: userId,
        applicationId,
      },
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  // Delete a user only if they belong to the application.

  async deleteByIdInApplication(applicationId: Types.ObjectId, userId: string) {
    return User.findOneAndDelete({
      _id: userId,
      applicationId,
    });
  }

  // Legacy/global query retained for existing internal callers.

  async findAll() {
    return User.find().sort({
      createdAt: -1,
    });
  }

  async updateById(userId: string, data: Record<string, unknown>) {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async deleteById(userId: string) {
    return User.findByIdAndDelete(userId);
  }
}

export const userRepository = new UserRepository();
