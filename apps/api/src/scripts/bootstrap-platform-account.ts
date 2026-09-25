import mongoose from "mongoose";

import { config } from "../config/index.js";

import { platformAccountRepository } from "../modules/platform-account/index.js";
import { PlatformAccount } from "../modules/platform-account/model/platform-account.model.js";

import { passwordService } from "../security/password/password.service.js";

async function bootstrapPlatformAccount() {
  const email = config.PLATFORM_OWNER_EMAIL.toLowerCase().trim();
  const password = config.PLATFORM_OWNER_PASSWORD;

  console.log("Connecting to MongoDB...");

  await mongoose.connect(config.MONGODB_URI);

  console.log("MongoDB connected.");

  const existingAccount = await platformAccountRepository.findByEmail(email);

  if (existingAccount) {
    console.log(`Platform account already exists for ${email}.`);

    return;
  }

  const passwordHashed = await passwordService.hash(password);

  const account = await PlatformAccount.create({
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

try {
  await bootstrapPlatformAccount();
} catch (error) {
  console.error("Failed to bootstrap platform account.");
  console.error(error);

  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
