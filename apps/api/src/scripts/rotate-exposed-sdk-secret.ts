import "dotenv/config";

import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { chmod, writeFile } from "node:fs/promises";
import path from "node:path";

import { config } from "../config/index.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "../database/connection.js";
import { Application } from "../modules/application/model/application.model.js";
import { Workspace } from "../modules/workspace/model/workspace.model.js";
import { passwordService } from "../security/password/password.service.js";

const EXPECTED_APPLICATION = "DigitAuth SDK Integration Application";
const EXPECTED_WORKSPACE = "DigitAuth SDK Integration Workspace";
const EXPECTED_OWNER_ID = "000000000000000000000007";
const EXAMPLE_FILE =
  "packages/sdk-node/examples/express/.env.example";
const SECRETS_FILE = path.resolve(
  process.cwd(),
  "../../.digit-auth-sdk-test-secrets.sh",
);

function getCommittedCredentials() {
  const committedExample = execFileSync(
    "git",
    ["-C", "../..", "show", `HEAD:${EXAMPLE_FILE}`],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );

  const clientId = committedExample
    .match(/^DIGIT_AUTH_CLIENT_ID=(.+)$/m)?.[1]?.trim();
  const clientSecret = committedExample
    .match(/^DIGIT_AUTH_CLIENT_SECRET=(.+)$/m)?.[1]?.trim();

  if (
    !clientId ||
    !clientSecret ||
    clientId === "your_digit_auth_client_id" ||
    clientSecret === "your_digit_auth_client_secret"
  ) {
    throw new Error("Could not safely identify the committed test credentials.");
  }

  return { clientId, clientSecret };
}

async function main() {
  if (process.env.NODE_ENV !== "test" || !config.isTest) {
    throw new Error("STOP: run this script only with NODE_ENV=test.");
  }

  const testDatabaseName = new URL(config.MONGODB_TEST_URI)
    .pathname.replace(/^\/+/, "");

  if (testDatabaseName !== "digit-auth-test") {
    throw new Error("STOP: the configured test database name did not match.");
  }

  const { clientId, clientSecret: oldSecret } =
    getCommittedCredentials();

  await connectDatabase();

  try {
    const application = await Application.findOne({ clientId })
      .select("+clientSecretHash");

    if (!application) {
      throw new Error("STOP: the exact existing application was not found.");
    }

    if (application.name !== EXPECTED_APPLICATION) {
      throw new Error("STOP: the application name did not match.");
    }

    const workspace = await Workspace.findById(application.workspaceId);

    if (
      !workspace ||
      workspace.name !== EXPECTED_WORKSPACE ||
      workspace.ownerId.toString() !== EXPECTED_OWNER_ID
    ) {
      throw new Error("STOP: the expected test workspace was not verified.");
    }

    const oldSecretValid = await passwordService.verify(
      application.clientSecretHash,
      oldSecret,
    );

    if (!oldSecretValid) {
      throw new Error(
        "STOP: the committed secret did not match the stored hash; nothing was rotated.",
      );
    }

    const newSecret = `das_${crypto.randomBytes(32).toString("hex")}`;
    const newHash = await passwordService.hash(newSecret);

    const fileContent = [
      "# Local test credentials. Do not commit or share this file.",
      "export DIGIT_AUTH_API_URL=http://localhost:5000/api/v1",
      `export DIGIT_AUTH_CLIENT_ID=${clientId}`,
      `export DIGIT_AUTH_CLIENT_SECRET=${newSecret}`,
      "",
    ].join("\n");

    await writeFile(SECRETS_FILE, fileContent, {
      encoding: "utf8",
      mode: 0o600,
      flag: "w",
    });
    await chmod(SECRETS_FILE, 0o600);

    const result = await Application.updateOne(
      {
        _id: application._id,
        workspaceId: workspace._id,
        clientId,
      },
      { $set: { clientSecretHash: newHash } },
    );

    if (result.modifiedCount !== 1) {
      throw new Error(
        "Rotation was not confirmed. Inspect the local secrets file before retrying.",
      );
    }

    const updated = await Application.findById(application._id)
      .select("+clientSecretHash");

    if (
      !updated ||
      !(await passwordService.verify(updated.clientSecretHash, newSecret)) ||
      (await passwordService.verify(updated.clientSecretHash, oldSecret))
    ) {
      throw new Error(
        "Rotation verification failed. Keep the local secrets file safe and investigate before proceeding.",
      );
    }

    console.log("SUCCESS: existing test application secret rotated.");
    console.log("SUCCESS: new secret verified; old secret rejected.");
    console.log("SUCCESS: replacement credentials saved to the ignored local file.");
    console.log("No credentials were printed.");
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown rotation error.";
  console.error(`Rotation stopped: ${message}`);
  process.exitCode = 1;
});
