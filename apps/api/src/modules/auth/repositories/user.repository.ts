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
}

export const userRepository = new UserRepository();
