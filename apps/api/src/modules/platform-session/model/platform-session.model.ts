import { Schema, model } from "mongoose";
import type { HydratedDocument, InferSchemaType } from "mongoose";

const platformSessionSchema = new Schema(
  {
    platformAccountId: {
      type: Schema.Types.ObjectId,
      ref: "PlatformAccount",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
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
      index: true,
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

platformSessionSchema.index({
  platformAccountId: 1,
  expiresAt: 1,
});

export type PlatformSessionSchema = InferSchemaType<
  typeof platformSessionSchema
>;

export type PlatformSessionDocument = HydratedDocument<PlatformSessionSchema>;

export const PlatformSession = model<PlatformSessionSchema>(
  "PlatformSession",
  platformSessionSchema,
);
