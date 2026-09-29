import mongoose from "mongoose";

import { config } from "../config/index.js";

import { platformAccountRepository } from "../modules/platform-account/index.js";
import { workspaceRepository } from "../modules/workspace/index.js";
import { Application } from "../modules/application/model/application.model.js";

async function migrateApplicationWorkspaces() {
  const email = config.PLATFORM_OWNER_EMAIL.toLowerCase().trim();

  console.log("Connecting to MongoDB...");

  await mongoose.connect(config.MONGODB_URI);

  console.log("MongoDB connected.");

  const account = await platformAccountRepository.findByEmail(email);

  if (!account) {
    throw new Error(
      `Platform account not found for ${email}. Run the platform bootstrap first.`,
    );
  }

  const workspace = await workspaceRepository.findByOwnerId(account.id);

  if (!workspace) {
    throw new Error(
      `Workspace not found for platform account ${email}. Run the platform bootstrap first.`,
    );
  }

  const result = await Application.updateMany(
    {
      workspaceId: {
        $exists: false,
      },
    },
    {
      $set: {
        workspaceId: workspace.id,
      },
    },
  );

  console.log("");
  console.log("========================================");
  console.log("Application workspace migration");
  console.log("========================================");
  console.log(`Workspace: ${workspace.name}`);
  console.log(`Workspace ID: ${workspace.id}`);
  console.log(`Matched applications: ${result.matchedCount}`);
  console.log(`Updated applications: ${result.modifiedCount}`);
  console.log("========================================");
  console.log("");
}

try {
  await migrateApplicationWorkspaces();
} catch (error) {
  console.error("Failed to migrate application workspaces.");
  console.error(error);

  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
