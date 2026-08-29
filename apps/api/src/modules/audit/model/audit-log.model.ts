import { Schema, model, Types, type InferSchemaType } from "mongoose";

import { AuditEvent } from "../types/audit-event.js";

const auditSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    event: {
      type: String,
      enum: Object.values(AuditEvent),
      required: true,
      index: true,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export type AuditLogDocument = InferSchemaType<typeof auditSchema> & {
  _id: Types.ObjectId;
};

export const AuditLog = model("AuditLog", auditSchema);
