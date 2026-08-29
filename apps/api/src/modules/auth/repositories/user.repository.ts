import { Types, type ClientSession } from "mongoose";
import { User, type UserDocument } from "../model/user.model.js";
import { withSession } from "../../../shared/utils/mongoose.js";

export class UserRepository {
  // find a user by email

  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({
      email: email.toLowerCase(),
    });
  }

  // find a user by ID

  async findById(id: string): Promise<UserDocument | null> {
    return User.findById(id);
  }

  // create a new user

  async create(
    data: {
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

  async findEmailWithPassword(email: string): Promise<UserDocument | null> {
    return User.findOne({
      email: email.toLowerCase(),
    }).select("+passwordHashed");
  }

  async verifyUser(
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      {
        emailVerified: true,
      },
      withSession(session),
    );
  }

  async updatePassword(
    userId: Types.ObjectId,
    passwordHashed: string,
    session?: ClientSession,
  ): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      {
        passwordHashed,
      },
      withSession(session),
    );
  }

  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $inc: {
        failedLoginAttempts: 1,
      },
    });
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  async lockAccount(userId: string, lockedUntil: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      lockedUntil,
    });
  }

  async unlockAccount(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  async getFailedAttempts(userId: string): Promise<number> {
    const user = await User.findById(userId).select("failedLoginAttempts");

    return user?.failedLoginAttempts ?? 0;
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
    },
  ) {
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
