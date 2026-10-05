import { Types, type ClientSession } from "mongoose";

import {
  PlatformPasswordResetToken,
  type PlatformPasswordResetTokenDocument,
} from "../model/platform-password-reset-token.model.js";

export class PlatformPasswordResetRepository {
  async create(data: {
    platformAccountId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PlatformPasswordResetTokenDocument> {
    return PlatformPasswordResetToken.create({
      platformAccountId: new Types.ObjectId(data.platformAccountId),
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    });
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<PlatformPasswordResetTokenDocument | null> {
    return PlatformPasswordResetToken.findOne({
      tokenHash,
    }).select("+tokenHash");
  }

  async deleteById(id: string, session?: ClientSession): Promise<void> {
    await PlatformPasswordResetToken.deleteOne(
      {
        _id: new Types.ObjectId(id),
      },
      session ? { session } : undefined,
    );
  }

  async deleteByAccountId(
    platformAccountId: string,
    session?: ClientSession,
  ): Promise<void> {
    await PlatformPasswordResetToken.deleteMany(
      {
        platformAccountId: new Types.ObjectId(platformAccountId),
      },
      session ? { session } : undefined,
    );
  }
}

export const platformPasswordResetRepository =
  new PlatformPasswordResetRepository();
