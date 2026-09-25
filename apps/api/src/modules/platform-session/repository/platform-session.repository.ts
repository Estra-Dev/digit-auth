import { Types } from "mongoose";

import {
  PlatformSession,
  type PlatformSessionDocument,
} from "../model/platform-session.model.js";

export class PlatformSessionRepository {
  async create(data: {
    sessionId: string;
    platformAccountId: Types.ObjectId;
    refreshTokenHash: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
  }): Promise<PlatformSessionDocument> {
    return PlatformSession.create({
      _id: data.sessionId,
      platformAccountId: data.platformAccountId,
      refreshTokenHash: data.refreshTokenHash,
      userAgent: data.userAgent ?? null,
      ipAddress: data.ipAddress ?? null,
      expiresAt: data.expiresAt,
    });
  }

  async findById(sessionId: string): Promise<PlatformSessionDocument | null> {
    return PlatformSession.findById(sessionId);
  }

  async findByIdWithRefreshToken(
    sessionId: string,
  ): Promise<PlatformSessionDocument | null> {
    return PlatformSession.findById(sessionId).select("+refreshTokenHash");
  }

  async findByRefreshTokenHash(
    platformAccountId: Types.ObjectId,
    refreshTokenHash: string,
  ): Promise<PlatformSessionDocument | null> {
    return PlatformSession.findOne({
      platformAccountId,
      refreshTokenHash,
    }).select("+refreshTokenHash");
  }

  async findByAccountId(
    platformAccountId: Types.ObjectId,
  ): Promise<PlatformSessionDocument[]> {
    return PlatformSession.find({
      platformAccountId,
    }).sort({
      lastUsedAt: -1,
    });
  }

  async updateRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<PlatformSessionDocument | null> {
    return PlatformSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          refreshTokenHash,
          expiresAt,
          lastUsedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async updateLastUsed(
    sessionId: string,
  ): Promise<PlatformSessionDocument | null> {
    return PlatformSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          lastUsedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );
  }

  async deleteById(sessionId: string): Promise<PlatformSessionDocument | null> {
    return PlatformSession.findByIdAndDelete(sessionId);
  }

  async deleteByAccountId(platformAccountId: Types.ObjectId): Promise<void> {
    await PlatformSession.deleteMany({
      platformAccountId,
    });
  }

  async deleteOtherSessions(
    platformAccountId: Types.ObjectId,
    currentSessionId: string,
  ): Promise<void> {
    await PlatformSession.deleteMany({
      platformAccountId,
      _id: {
        $ne: currentSessionId,
      },
    });
  }
}

export const platformSessionRepository = new PlatformSessionRepository();
