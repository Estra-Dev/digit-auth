import { Schema, model, Types } from "mongoose";

import { SecurityEvent } from "../types/security-event.js";

const securityEventSchema = new Schema(
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

    event: {
      type: String,
      enum: Object.values(SecurityEvent),
      required: true,
    },

    ipAddress: String,

    userAgent: String,

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

securityEventSchema.index({
  applicationId: 1,
  userId: 1,
  createdAt: -1,
});

securityEventSchema.index({
  applicationId: 1,
  event: 1,
});

export const SecurityEventModel = model("SecurityEvent", securityEventSchema);
