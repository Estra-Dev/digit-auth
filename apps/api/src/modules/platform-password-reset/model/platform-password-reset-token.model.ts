import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const platformPasswordResetTokenSchema = new Schema(
  {
    platformAccountId: {
      type: Schema.Types.ObjectId,
      ref: "PlatformAccount",
      required: true,
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
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

platformPasswordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

platformPasswordResetTokenSchema.index({
  platformAccountId: 1,
});

export type PlatformPasswordResetTokenSchema = InferSchemaType<
  typeof platformPasswordResetTokenSchema
>;

export type PlatformPasswordResetTokenDocument =
  HydratedDocument<PlatformPasswordResetTokenSchema>;

export const PlatformPasswordResetToken =
  model<PlatformPasswordResetTokenSchema>(
    "PlatformPasswordResetToken",
    platformPasswordResetTokenSchema,
  );
