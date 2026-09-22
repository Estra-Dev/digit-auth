import {
  Schema,
  Types,
  type InferSchemaType,
  type HydratedDocument,
  model,
} from "mongoose";

const passwordResetTokenSchema = new Schema(
  {
    applicationId: {
      type: Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },

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

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

passwordResetTokenSchema.index({
  applicationId: 1,
  userId: 1,
});

export type PasswordResetTokenSchema = InferSchemaType<
  typeof passwordResetTokenSchema
>;

export type PasswordResetTokenDocument =
  HydratedDocument<PasswordResetTokenSchema>;

export const PasswordResetToken = model<PasswordResetTokenSchema>(
  "PasswordResetToken",
  passwordResetTokenSchema,
);
