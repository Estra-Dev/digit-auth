import "dotenv/config";

import { connectDatabase, disconnectDatabase } from "../database/connection.js";

import { applicationService } from "../modules/application/service/application.service.js";
import { workspaceRepository } from "../modules/workspace/index.js";

const TEST_OWNER_ID = "000000000000000000000007";
const WORKSPACE_NAME = "DigitAuth SDK Integration Workspace";
const APPLICATION_NAME = "DigitAuth SDK Integration Application";

async function main() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("This script must be run with NODE_ENV=test.");
  }

  throw new Error(
    [
      "Bootstrap disabled for safety.",
      "This script creates a new application and previously printed its client secret.",
      "Use the existing integration application for credential rotation instead.",
    ].join(" "),
  );

  // Retained imports are temporarily unused while bootstrap is disabled.
  void connectDatabase;
  void disconnectDatabase;
  void applicationService;
  void workspaceRepository;
  void TEST_OWNER_ID;
  void WORKSPACE_NAME;
  void APPLICATION_NAME;
}

main().catch(() => {
  console.error(
    "SDK integration bootstrap stopped. No credentials were printed.",
  );
  process.exitCode = 1;
});
