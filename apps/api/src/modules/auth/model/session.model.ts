import {
  Schema,
  model,
  Types,
  type InferSchemaType,
  type HydratedDocument,
} from "mongoose";

const sessionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      select: false,
      required: true,
    },

    userAgent: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({
  userId: 1,
  refreshTokenHash: 1,
});

export type SessionSchema = InferSchemaType<typeof sessionSchema>;
export type SessionDocument = HydratedDocument<SessionSchema>;

export const Session = model<SessionSchema>("Session", sessionSchema);
