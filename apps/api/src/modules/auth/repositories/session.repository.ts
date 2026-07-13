import { Types } from "mongoose";
import { Session, type SessionDocument } from "../model/session.model.js";

export class SessionRepository {
  // create a new session

  async create(data: {
    userId: Types.ObjectId;
    refreshTokenHash: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
  }): Promise<SessionDocument> {
    return Session.create(data);
  }

  // find a session by id
  async findById(id: string): Promise<SessionDocument | null> {
    return Session.findById(id);
  }

  // find all session for a user
  async findByUserId(userId: Types.ObjectId): Promise<SessionDocument[]> {
    return Session.find({ userId }).sort({
      createdAt: -1,
    });
  }

  // delete one Session
  async deleteById(id: string): Promise<void> {
    await Session.findByIdAndDelete(id);
  }

  async deleteByUserId(userId: Types.ObjectId): Promise<void> {
    await Session.deleteMany(userId);
  }

  // delete all session for a user
  async deleteAllForUser(userId: Types.ObjectId): Promise<void> {
    await Session.deleteMany({ userId });
  }

  // Find session by user ID and refresh token hash
  async findByUserIdAndToken(
    userId: Types.ObjectId,
    refreshTokenHash: string,
  ): Promise<SessionDocument | null> {
    return Session.findOne({
      userId,
      refreshTokenHash,
    }).select("+refreshTokenHash");
  }

  // Update last used time
  async updateLastUsed(sessionId: string): Promise<void> {
    await Session.findByIdAndUpdate(sessionId, {
      lastUsedAt: new Date(),
    });
  }

  // Delete expired sessions
  async deleteExpired(): Promise<void> {
    await Session.deleteMany({
      expiresAt: {
        $lt: new Date(),
      },
    });
  }

  async findByUserIdAndRefreshTokenHash(
    userId: Types.ObjectId,
    refreshTokenHash: string,
  ): Promise<SessionDocument | null> {
    return Session.findOne({
      userId,
      refreshTokenHash,
    }).select("+refreshTokenHash");
  }
}

export const sessionRepository = new SessionRepository();
