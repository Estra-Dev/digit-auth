import "dotenv/config";

import { config } from "../config/index.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "../database/connection.js";
import { Application } from "../modules/application/model/application.model.js";
import { Workspace } from "../modules/workspace/model/workspace.model.js";

async function main() {
  if (process.env.NODE_ENV !== "test" || !config.isTest) {
    throw new Error("STOP: diagnostic must use NODE_ENV=test.");
  }

  const databaseName = new URL(config.MONGODB_TEST_URI)
    .pathname.replace(/^\/+/, "");

  if (databaseName !== "digit-auth-test") {
    throw new Error("STOP: unexpected test database name.");
  }

  await connectDatabase();

  try {
    const applications = await Application.find({})
      .select("name status workspaceId clientId createdAt")
      .lean();

    console.log(`Applications found: ${applications.length}`);

    for (const app of applications) {
      const workspace = await Workspace.findById(app.workspaceId)
        .select("name")
        .lean();

      console.log({
        applicationName: app.name,
        status: app.status,
        workspaceName: workspace?.name ?? "(workspace not found)",
        createdAt: app.createdAt,
        clientIdSuffix: app.clientId.slice(-5),
      });
    }
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Diagnostic failed.",
  );
  process.exitCode = 1;
});
