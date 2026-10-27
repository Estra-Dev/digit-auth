import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

import { config } from "../config/index.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "../database/connection.js";
import { Application } from "../modules/application/model/application.model.js";
import { Workspace } from "../modules/workspace/model/workspace.model.js";

function readClientId(file: string): string | undefined {
  if (!fs.existsSync(file)) return undefined;

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*DIGIT_AUTH_CLIENT_ID\s*=\s*(.*?)\s*$/);
    if (match?.[1] !== undefined) return match[1].replace(/^["']|["']$/g, "");
  }

  return undefined;
}

async function main() {
  if (process.env.NODE_ENV !== "development" || !config.isDevelopment) {
    throw new Error("STOP: run only with NODE_ENV=development.");
  }

  const databaseName = new URL(config.MONGODB_URI)
    .pathname.replace(/^\/+/, "");

  if (databaseName !== "digit-auth") {
    throw new Error("STOP: primary database name did not match.");
  }

  const root = path.resolve(process.cwd(), "../..");
  const files = [
    "packages/sdk-node/examples/express/.env",
    "packages/sdk-node/.env.test",
  ];

  await connectDatabase();

  try {
    for (const relativeFile of files) {
      const clientId = readClientId(path.join(root, relativeFile));

      console.log(`\nSource: ${relativeFile}`);

      if (!clientId) {
        console.log("Client ID missing.");
        continue;
      }

      const app = await Application.findOne({ clientId })
        .select("name status workspaceId clientId")
        .lean();

      if (!app) {
        console.log("Application not found in primary database.");
        continue;
      }

      const workspace = await Workspace.findById(app.workspaceId)
        .select("name")
        .lean();

      console.log({
        found: true,
        applicationName: app.name,
        workspaceName: workspace?.name ?? "(workspace missing)",
        status: app.status,
        clientIdSuffix: app.clientId.slice(-5),
      });
    }
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Lookup failed.");
  process.exitCode = 1;
});
