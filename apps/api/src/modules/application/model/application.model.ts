import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

import { ApplicationStatus } from "../types/application.types.js";

const applicationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    clientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    clientSecretHash: {
      type: String,
      required: true,
      select: false,
    },

    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.ACTIVE,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type ApplicationSchema = InferSchemaType<typeof applicationSchema>;

export type ApplicationDocument = HydratedDocument<ApplicationSchema>;

export const Application = model<ApplicationSchema>(
  "Application",
  applicationSchema,
);
