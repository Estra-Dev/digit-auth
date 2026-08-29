import type { SessionDocument } from "../model/session.model.js";

export class SessionMapper {
  static toResponse(session: SessionDocument) {
    return {
      id: session.id,

      userAgent: session.userAgent,

      ipAddress: session.ipAddress,

      createdAt: session.createdAt,

      expiresAt: session.expiresAt,

      lastUsedAt: session.lastUsedAt,
    };
  }
}
