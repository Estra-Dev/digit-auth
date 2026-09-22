import {
  Schema,
  Types,
  type InferSchemaType,
  type HydratedDocument,
  model,
} from "mongoose";

const verificationTokenSchema = new Schema(
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
      unique: true,
      select: false,
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

verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

verificationTokenSchema.index({
  applicationId: 1,
  userId: 1,
});

export type VerificationTokenSchema = InferSchemaType<
  typeof verificationTokenSchema
>;

export type VerificationTokenDocument =
  HydratedDocument<VerificationTokenSchema>;

export const VerificationToken = model<VerificationTokenSchema>(
  "VerificationToken",
  verificationTokenSchema,
);
