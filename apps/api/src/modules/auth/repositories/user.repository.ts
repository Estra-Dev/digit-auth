import { User, type UserDocument } from "../model/user.model.js";

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

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHashed: string;
  }): Promise<UserDocument> {
    return User.create({
      ...data,
      email: data.email.toLowerCase(),
    });
  }

  async findEmailWithPassword(email: string): Promise<UserDocument | null> {
    return User.findOne({
      email: email.toLowerCase(),
    }).select("+passwordHashed");
  }
}

export const userRepository = new UserRepository();
