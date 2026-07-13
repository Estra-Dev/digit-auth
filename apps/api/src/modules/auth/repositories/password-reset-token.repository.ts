import { Types } from "mongoose";
import {
  PasswordResetToken,
  type PasswordResetTokenDocument,
} from "../model/password-reset-token.model.js";

export class PasswordResetRepository {
  // Create a password reset token
  async create(data: {
    userId: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetTokenDocument> {
    return PasswordResetToken.create(data);
  }

  // Find a token by its hash
  async findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenDocument | null> {
    return PasswordResetToken.findOne({ tokenHash });
  }

  // Delete one reset token

  async deleteById(id: string): Promise<void> {
    await PasswordResetToken.findByIdAndDelete(id);
  }

  // Delete all reset tokens for a user
  async deleteByUserId(userId: Types.ObjectId): Promise<void> {
    await PasswordResetToken.deleteMany({ userId });
  }
}

export const passwordResetTokenRepository = new PasswordResetRepository();
