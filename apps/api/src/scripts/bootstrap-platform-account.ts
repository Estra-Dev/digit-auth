import mongoose from "mongoose";

import { config } from "../config/index.js";

import { platformAccountRepository } from "../modules/platform-account/index.js";
import { PlatformAccount } from "../modules/platform-account/model/platform-account.model.js";

import { workspaceRepository } from "../modules/workspace/index.js";

import { passwordService } from "../security/password/password.service.js";

async function bootstrapPlatformAccount() {
  const email = config.PLATFORM_OWNER_EMAIL.toLowerCase().trim();
  const password = config.PLATFORM_OWNER_PASSWORD;

  console.log("Connecting to MongoDB...");

  await mongoose.connect(config.MONGODB_URI);

  console.log("MongoDB connected.");

  let account = await platformAccountRepository.findByEmail(email);

  if (account) {
    console.log(`Platform account already exists for ${email}.`);
  } else {
    const passwordHashed = await passwordService.hash(password);

    account = await PlatformAccount.create({
      email,
      passwordHashed,
      emailVerified: true,
    });

    console.log("");
    console.log("========================================");
    console.log("DigitAuth platform owner created");
    console.log("========================================");
    console.log(`ID: ${account.id}`);
    console.log(`Email: ${account.email}`);
    console.log(`Status: ${account.status}`);
    console.log(`Email verified: ${account.emailVerified}`);
    console.log("========================================");
    console.log("");
  }

  const existingWorkspace = await workspaceRepository.findByOwnerId(account.id);

  if (existingWorkspace) {
    console.log(
      `Workspace already exists for ${account.email}: ${existingWorkspace.name}`,
    );

    return;
  }

  const workspace = await workspaceRepository.create({
    ownerId: account.id,
    name: "My Workspace",
  });

  console.log("");
  console.log("========================================");
  console.log("DigitAuth workspace created");
  console.log("========================================");
  console.log(`Workspace ID: ${workspace.id}`);
  console.log(`Workspace name: ${workspace.name}`);
  console.log(`Owner: ${account.email}`);
  console.log("========================================");
  console.log("");
}

try {
  await bootstrapPlatformAccount();
} catch (error) {
  console.error("Failed to bootstrap platform account.");
  console.error(error);

  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
