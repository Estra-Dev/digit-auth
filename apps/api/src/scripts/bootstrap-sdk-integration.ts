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

  await connectDatabase();

  try {
    let workspace = await workspaceRepository.findByOwnerId(TEST_OWNER_ID);

    if (!workspace) {
      workspace = await workspaceRepository.create({
        ownerId: TEST_OWNER_ID,
        name: WORKSPACE_NAME,
      });
    }

    const { application, credentials } =
      await applicationService.createApplication(
        workspace.id,
        APPLICATION_NAME,
      );

    console.log(
      JSON.stringify(
        {
          workspaceId: workspace.id,
          applicationId: application.id,
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
        },
        null,
        2,
      ),
    );
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
