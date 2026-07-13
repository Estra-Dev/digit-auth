import { Types } from "mongoose";
import {
  VerificationToken,
  type VerificationTokenDocument,
} from "../model/verification-token.model.js";

export class VerificationTokenRepository {
  async create(data: {
    userId: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<VerificationTokenDocument> {
    return VerificationToken.create(data);
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<VerificationTokenDocument | null> {
    return VerificationToken.findOne({
      tokenHash,
    }).select("+tokenHash");
  }

  async deleteById(id: string): Promise<void> {
    await VerificationToken.findByIdAndDelete(id);
  }

  async deleteByUserId(userId: Types.ObjectId): Promise<void> {
    await VerificationToken.deleteMany({ userId });
  }
}

export const verificationTokenRepository = new VerificationTokenRepository();
