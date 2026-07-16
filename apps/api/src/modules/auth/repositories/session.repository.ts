import { Types, type ClientSession } from "mongoose";
import { Session, type SessionDocument } from "../model/session.model.js";
import { withSession } from "../../../shared/utils/mongoose.js";

export class SessionRepository {
  // create a new session

  async create(
    data: {
      userId: Types.ObjectId;
      refreshTokenHash: string;
      userAgent?: string | null;
      ipAddress?: string | null;
      expiresAt: Date;
    },
    session?: ClientSession,
  ): Promise<SessionDocument> {
    const sessionDoc = new Session(data);

    await sessionDoc.save(withSession(session));

    return sessionDoc;
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
  async deleteById(id: string, session?: ClientSession): Promise<void> {
    await Session.findByIdAndDelete(id, withSession(session));
  }

  async deleteByUserId(
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<void> {
    await Session.deleteMany({ userId }, withSession(session));
  }

  // delete all session for a user
  async deleteAllForUser(userId: Types.ObjectId): Promise<void> {
    await Session.deleteMany({ userId });
  }

  // Update last used time
  async updateLastUsed(
    sessionId: string,
    session?: ClientSession,
  ): Promise<void> {
    await Session.findByIdAndUpdate(
      sessionId,
      {
        lastUsedAt: new Date(),
      },
      withSession(session),
    );
  }

  // Delete expired sessions
  async deleteExpired(): Promise<void> {
    await Session.deleteMany({
      expiresAt: {
        $lt: new Date(),
      },
    });
  }

  // Find session by user ID and refresh token hash
  async findByUserIdAndRefreshTokenHash(
    userId: Types.ObjectId,
    refreshTokenHash: string,
  ): Promise<SessionDocument | null> {
    return Session.findOne({
      userId,
      refreshTokenHash,
    }).select("+refreshTokenHash");
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<SessionDocument | null> {
    return Session.findOne({
      refreshTokenHash,
    }).select("+refreshTokenHash");
  }
}

export const sessionRepository = new SessionRepository();
