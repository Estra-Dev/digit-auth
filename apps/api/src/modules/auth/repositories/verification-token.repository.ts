import { Types, type ClientSession } from "mongoose";
import {
  VerificationToken,
  type VerificationTokenDocument,
} from "../model/verification-token.model.js";
import { withSession } from "../../../shared/utils/mongoose.js";

export class VerificationTokenRepository {
  async create(
    data: {
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
    tokenHash: string,
  ): Promise<VerificationTokenDocument | null> {
    return VerificationToken.findOne({
      tokenHash,
    }).select("+tokenHash");
  }

  async deleteById(id: string, session?: ClientSession): Promise<void> {
    await VerificationToken.findByIdAndDelete(id, withSession(session));
  }

  async deleteByUserId(
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<void> {
    await VerificationToken.deleteMany({ userId }, withSession(session));
  }
}

export const verificationTokenRepository = new VerificationTokenRepository();
