import { Types } from "mongoose";

import { User } from "../../auth/model/user.model.js";

export class ProfileRepository {
  async findById(applicationId: Types.ObjectId, userId: string) {
    return User.findOne({
      _id: userId,
      applicationId,
    }).select("+passwordHashed");
  }

  async updateById(
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

  async updatePassword(
    applicationId: Types.ObjectId,
    userId: string,
    passwordHashed: string,
  ) {
    return User.findOneAndUpdate(
      {
        _id: userId,
        applicationId,
      },
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

  async deleteById(applicationId: Types.ObjectId, userId: string) {
    return User.findOneAndDelete({
      _id: userId,
      applicationId,
    });
  }
}

export const profileRepository = new ProfileRepository();
