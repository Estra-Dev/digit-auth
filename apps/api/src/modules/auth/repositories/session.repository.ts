import { Types, type ClientSession } from "mongoose";

import { Session, type SessionDocument } from "../model/session.model.js";

import { withSession } from "../../../shared/utils/mongoose.js";

export class SessionRepository {
  async create(
    data: {
      applicationId: Types.ObjectId;
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

  async findById(id: string): Promise<SessionDocument | null> {
    return Session.findById(id);
  }

  async findByUserId(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<SessionDocument[]> {
    return Session.find({
      applicationId,
      userId,
    }).sort({
      createdAt: -1,
    });
  }

  async deleteById(id: string, session?: ClientSession): Promise<void> {
    await Session.findByIdAndDelete(id, withSession(session));
  }

  async deleteByIdInApplication(
    applicationId: Types.ObjectId,
    sessionId: string,
    session?: ClientSession,
  ): Promise<void> {
    await Session.findOneAndDelete(
      {
        _id: sessionId,
        applicationId,
      },
      withSession(session),
    );
  }

  async deleteByIdForUser(
    applicationId: Types.ObjectId,
    sessionId: string,
    userId: Types.ObjectId,
  ): Promise<void> {
    await Session.findOneAndDelete({
      _id: sessionId,
      applicationId,
      userId,
    });
  }

  async deleteByUserId(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<void> {
    await Session.deleteMany(
      {
        applicationId,
        userId,
      },
      withSession(session),
    );
  }

  async deleteAllForUser(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    await Session.deleteMany({
      applicationId,
      userId,
    });
  }

  async deleteOthers(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
    currentSessionId: string,
  ): Promise<void> {
    await Session.deleteMany({
      applicationId,
      userId,
      _id: {
        $ne: currentSessionId,
      },
    });
  }

  async belongsToUser(
    applicationId: Types.ObjectId,
    sessionId: string,
    userId: Types.ObjectId,
  ): Promise<boolean> {
    const session = await Session.exists({
      _id: sessionId,
      applicationId,
      userId,
    });

    return !!session;
  }

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

  async deleteExpired(): Promise<void> {
    await Session.deleteMany({
      expiresAt: {
        $lt: new Date(),
      },
    });
  }

  async findByUserIdAndRefreshTokenHash(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
    refreshTokenHash: string,
  ): Promise<SessionDocument | null> {
    return Session.findOne({
      applicationId,
      userId,
      refreshTokenHash,
    }).select("+refreshTokenHash");
  }

  async findByRefreshTokenHash(
    applicationId: Types.ObjectId,
    refreshTokenHash: string,
  ): Promise<SessionDocument | null> {
    return Session.findOne({
      applicationId,
      refreshTokenHash,
    }).select("+refreshTokenHash");
  }

  async findCurrentSession(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
    refreshTokenHash: string,
  ): Promise<SessionDocument | null> {
    return Session.findOne({
      applicationId,
      userId,
      refreshTokenHash,
    }).select("+refreshTokenHash");
  }

  async findByIdForUser(
    applicationId: Types.ObjectId,
    sessionId: string,
    userId: Types.ObjectId,
  ): Promise<SessionDocument | null> {
    return Session.findOne({
      _id: sessionId,
      applicationId,
      userId,
    }).select("+refreshTokenHash");
  }

  async findByUserIdWithDetails(
    applicationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<SessionDocument[]> {
    return Session.find({
      applicationId,
      userId,
    })
      .select("-refreshTokenHash")
      .sort({
        createdAt: -1,
      });
  }
}

export const sessionRepository = new SessionRepository();
