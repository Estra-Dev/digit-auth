import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

import { WorkspaceStatus } from "../types/workspace.types.js";

const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "PlatformAccount",
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(WorkspaceStatus),
      default: WorkspaceStatus.ACTIVE,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type WorkspaceSchema = InferSchemaType<typeof workspaceSchema>;

export type WorkspaceDocument = HydratedDocument<WorkspaceSchema>;

export const Workspace = model<WorkspaceSchema>("Workspace", workspaceSchema);
