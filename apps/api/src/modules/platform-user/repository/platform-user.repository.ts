import { User, type UserDocument } from "../../auth/model/user.model.js";

export class PlatformUserRepository {
  async findAll(): Promise<UserDocument[]> {
    return User.find()
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "applicationId",
        select: "name clientId status",
      });
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return User.findById(userId).populate({
      path: "applicationId",
      select: "name clientId status",
    });
  }
}

export const platformUserRepository =
  new PlatformUserRepository();
