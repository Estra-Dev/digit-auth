import { Types, type ClientSession } from "mongoose";

import {
  PasswordResetToken,
  type PasswordResetTokenDocument,
} from "../model/password-reset-token.model.js";

import { withSession } from "../../../shared/utils/mongoose.js";

export class PasswordResetRepository {
  async create(
    data: {
      applicationId: Types.ObjectId;
      userId: Types.ObjectId;
      tokenHash: string;
      expiresAt: Date;
    },
    session?: ClientSession,
  ): Promise<PasswordResetTokenDocument> {
    const token = new PasswordResetToken(data);

    await token.save(withSession(session));

    return token;
  }

  async findByTokenHash(
    applicationId: Types.ObjectId,
    tokenHash: string,
  ): Promise<PasswordResetTokenDocument | null> {
    return PasswordResetToken.findOne({
      applicationId,
      tokenHash,
    });
  }

  async deleteByIdInApplication(
    applicationId: Types.ObjectId,
    tokenId: string,
    session?: ClientSession,
  ): Promise<void> {
    await PasswordResetToken.findOneAndDelete(
      {
        _id: tokenId,
        applicationId,
      },
      withSession(session),
    );
  }

  async deleteByUserId(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<void> {
    await PasswordResetToken.deleteMany(
      {
        applicationId,
        userId,
      },
      withSession(session),
    );
  }
}

export const passwordResetTokenRepository = new PasswordResetRepository();
