import { Types, type ClientSession } from "mongoose";

import { withSession } from "../../../shared/utils/mongoose.js";
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
      { returnDocument: "after", runValidators: true },
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
      { returnDocument: "after", runValidators: true },
    );
  }

  async deleteById(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession,
  ) {
    return User.findOneAndDelete(
      {
        _id: userId,
        applicationId,
      },
      withSession(session),
    );
  }
}

export const profileRepository = new ProfileRepository();
