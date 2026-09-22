import { Types, type ClientSession } from "mongoose";

import {
  VerificationToken,
  type VerificationTokenDocument,
} from "../model/verification-token.model.js";

import { withSession } from "../../../shared/utils/mongoose.js";

export class VerificationTokenRepository {
  async create(
    data: {
      applicationId: Types.ObjectId;
      userId: Types.ObjectId;
      tokenHash: string;
      expiresAt: Date;
    },
    session?: ClientSession,
  ): Promise<VerificationTokenDocument> {
    const token = new VerificationToken(data);

    await token.save(withSession(session));

    return token;
  }

  async findByTokenHash(
    applicationId: Types.ObjectId,
    tokenHash: string,
  ): Promise<VerificationTokenDocument | null> {
    return VerificationToken.findOne({
      applicationId,
      tokenHash,
    }).select("+tokenHash");
  }

  async deleteByIdInApplication(
    applicationId: Types.ObjectId,
    tokenId: string,
    session?: ClientSession,
  ): Promise<void> {
    await VerificationToken.findOneAndDelete(
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
    await VerificationToken.deleteMany(
      {
        applicationId,
        userId,
      },
      withSession(session),
    );
  }
}

export const verificationTokenRepository = new VerificationTokenRepository();
