import mongoose, { Schema, Types } from "mongoose";

export interface WebhookEventDocument {
  applicationId: Types.ObjectId;
  event: "user.created" | "user.email_verified";
  resourceId: Types.ObjectId;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "delivered" | "failed";
  attempts: number;
  nextAttemptAt: Date;
  lockedAt: Date | null;
  claimToken: string | null;
  deliveredAt: Date | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const webhookEventSchema = new Schema<WebhookEventDocument>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    event: {
      type: String,
      enum: ["user.created", "user.email_verified"],
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "delivered", "failed"],
      default: "pending",
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextAttemptAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    claimToken: {
      type: String,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

webhookEventSchema.index({
  status: 1,
  nextAttemptAt: 1,
  createdAt: 1,
});

webhookEventSchema.index(
  { applicationId: 1, event: 1, resourceId: 1 },
  { unique: true },
);

const WebhookEvent =
  (mongoose.models.WebhookEvent as
    | mongoose.Model<WebhookEventDocument>
    | undefined) ??
  mongoose.model<WebhookEventDocument>("WebhookEvent", webhookEventSchema);

export default WebhookEvent;
