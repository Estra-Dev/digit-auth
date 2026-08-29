import { User } from "../../auth/model/user.model.js";

export class ProfileRepository {
  async findById(userId: string) {
    return User.findById(userId);
  }

  async updateById(
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

  async updatePassword(userId: string, passwordHashed: string) {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: {
          passwordHashed,
        },
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

export const profileRepository = new ProfileRepository();
