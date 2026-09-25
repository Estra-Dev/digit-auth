import { Schema, model } from "mongoose";
import type { HydratedDocument, InferSchemaType } from "mongoose";

import { PlatformAccountStatus } from "../types/platform-account.types.js";

const platformAccountSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    passwordHashed: {
      type: String,
      required: true,
      select: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: Object.values(PlatformAccountStatus),
      default: PlatformAccountStatus.ACTIVE,
      required: true,
      index: true,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type PlatformAccountSchema = InferSchemaType<
  typeof platformAccountSchema
>;

export type PlatformAccountDocument = HydratedDocument<PlatformAccountSchema>;

export const PlatformAccount = model<PlatformAccountSchema>(
  "PlatformAccount",
  platformAccountSchema,
);
