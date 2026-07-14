import { Types, type ClientSession } from "mongoose";
import {
  PasswordResetToken,
  type PasswordResetTokenDocument,
} from "../model/password-reset-token.model.js";
import { withSession } from "../../../shared/utils/mongoose.js";

export class PasswordResetRepository {
  // Create a password reset token
  async create(
    data: {
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

  // Find a token by its hash
  async findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenDocument | null> {
    return PasswordResetToken.findOne({ tokenHash });
  }

  // Delete one reset token

  async deleteById(id: string, session?: ClientSession): Promise<void> {
    await PasswordResetToken.findByIdAndDelete(id, withSession(session));
  }

  // Delete all reset tokens for a user
  async deleteByUserId(
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<void> {
    await PasswordResetToken.deleteMany({ userId }, withSession(session));
  }
}

export const passwordResetTokenRepository = new PasswordResetRepository();
