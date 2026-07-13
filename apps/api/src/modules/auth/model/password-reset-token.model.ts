import {
  Schema,
  Types,
  type InferSchemaType,
  type HydratedDocument,
  model,
} from "mongoose";
import { required } from "zod/mini";

const passwordResetTokenSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

//
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PasswordResetTokenSchema = InferSchemaType<
  typeof passwordResetTokenSchema
>;
export type PasswordResetTokenDocument =
  HydratedDocument<PasswordResetTokenSchema>;

export const PasswordResetToken = model<PasswordResetTokenSchema>(
  "PasswordResetToken",
  passwordResetTokenSchema,
);
