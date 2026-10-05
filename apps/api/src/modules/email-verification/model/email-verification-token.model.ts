import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const emailVerificationTokenSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "PlatformAccount",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type EmailVerificationTokenSchema = InferSchemaType<
  typeof emailVerificationTokenSchema
>;

export type EmailVerificationTokenDocument =
  HydratedDocument<EmailVerificationTokenSchema>;

export const EmailVerificationToken = model<EmailVerificationTokenSchema>(
  "EmailVerificationToken",
  emailVerificationTokenSchema,
);
