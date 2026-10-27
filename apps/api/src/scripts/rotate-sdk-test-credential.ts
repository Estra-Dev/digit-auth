import "dotenv/config";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { config } from "../config/index.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "../database/connection.js";
import { Application } from "../modules/application/model/application.model.js";
import { Workspace } from "../modules/workspace/model/workspace.model.js";
import { passwordService } from "../security/password/password.service.js";

async function main() {
  if (process.env.NODE_ENV !== "development" || !config.isDevelopment) {
    throw new Error("STOP: run only with NODE_ENV=development.");
  }

  const databaseName = new URL(config.MONGODB_URI)
    .pathname.replace(/^\/+/, "");

  if (databaseName !== "digit-auth") {
    throw new Error("STOP: primary database name did not match.");
  }

  const clientId = process.env.DIGIT_AUTH_CLIENT_ID;
  if (!clientId || !clientId.endsWith("5c1b7")) {
    throw new Error("STOP: expected SDK test client ID was not loaded.");
  }

  const repoRoot = path.resolve(process.cwd(), "../..");
  const envFile = path.join(repoRoot, "packages/sdk-node/.env.test");
  const originalFile = await fs.readFile(envFile, "utf8");

  const fileId = originalFile.match(/^DIGIT_AUTH_CLIENT_ID=(.*)$/m)?.[1]?.trim();
  const oldSecret = originalFile.match(
    /^DIGIT_AUTH_CLIENT_SECRET=(.*)$/m,
  )?.[1]?.trim();

  if (fileId !== clientId || !oldSecret) {
    throw new Error("STOP: local SDK credentials did not match the loaded environment.");
  }

  await connectDatabase();

  try {
    const app = await Application.findOne({ clientId })
      .select("+clientSecretHash");

    if (!app || app.name !== "Node SDK Integration Test") {
      throw new Error("STOP: expected application was not found.");
    }

    const workspace = await Workspace.findById(app.workspaceId);

    if (!workspace || workspace.name !== "My Workspace") {
      throw new Error("STOP: expected workspace was not found.");
    }

    const newSecret = `das_${crypto.randomBytes(32).toString("hex")}`;
    const newHash = await passwordService.hash(newSecret);

    const updatedFile = originalFile.replace(
      /^DIGIT_AUTH_CLIENT_SECRET=.*$/m,
      `DIGIT_AUTH_CLIENT_SECRET=${newSecret}`,
    );

    if (updatedFile === originalFile) {
      throw new Error("STOP: could not prepare updated credentials file.");
    }

    let fileChanged = false;
    let databaseChanged = false;

    try {
      await fs.writeFile(envFile, updatedFile, {
        encoding: "utf8",
        mode: 0o600,
      });
      await fs.chmod(envFile, 0o600);
      fileChanged = true;

      const result = await Application.updateOne(
        {
          _id: app._id,
          workspaceId: workspace._id,
          clientId,
          clientSecretHash: app.clientSecretHash,
        },
        { $set: { clientSecretHash: newHash } },
      );

      if (result.modifiedCount !== 1) {
        throw new Error("Database update was not confirmed.");
      }
      databaseChanged = true;

      const check = await Application.findById(app._id)
        .select("+clientSecretHash");

      if (
        !check ||
        !(await passwordService.verify(check.clientSecretHash, newSecret)) ||
        (await passwordService.verify(check.clientSecretHash, oldSecret))
      ) {
        throw new Error("Credential verification failed.");
      }

      console.log("SUCCESS: targeted application secret rotated.");
      console.log("SUCCESS: replacement saved to packages/sdk-node/.env.test.");
      console.log("SUCCESS: new secret accepted; old secret rejected.");
      console.log("No credentials printed.");
    } catch (error) {
      if (databaseChanged) {
        await Application.updateOne(
          { _id: app._id, workspaceId: workspace._id, clientId },
          { $set: { clientSecretHash: app.clientSecretHash } },
        );
      }
      if (fileChanged) {
        await fs.writeFile(envFile, originalFile, "utf8");
      }
      throw error;
    }
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  console.error(
    "Rotation stopped:",
    error instanceof Error ? error.message : "Unknown error.",
  );
  process.exitCode = 1;
});
