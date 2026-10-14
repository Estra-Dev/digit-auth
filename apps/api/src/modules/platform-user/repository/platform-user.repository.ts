import { Types } from "mongoose";

import { User, type UserDocument } from "../../auth/model/user.model.js";

export class PlatformUserRepository {
  async findAllByApplicationIds(
    applicationIds: Types.ObjectId[],
  ): Promise<UserDocument[]> {
    if (applicationIds.length === 0) {
      return [];
    }

    return User.find({
      applicationId: { $in: applicationIds },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "applicationId",
        select: "name clientId status",
      });
  }

  async findByIdAndApplicationIds(
    userId: string,
    applicationIds: Types.ObjectId[],
  ): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(userId) || applicationIds.length === 0) {
      return null;
    }

    return User.findOne({
      _id: new Types.ObjectId(userId),
      applicationId: { $in: applicationIds },
    }).populate({
      path: "applicationId",
      select: "name clientId status",
    });
  }
}

export const platformUserRepository = new PlatformUserRepository();
