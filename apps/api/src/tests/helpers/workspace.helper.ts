import { Types } from "mongoose";

import { workspaceRepository } from "../../modules/workspace/index.js";

const TEST_OWNER_ID = new Types.ObjectId();

export async function getTestWorkspace() {
  const existing = await workspaceRepository.findByOwnerId(
    TEST_OWNER_ID.toString(),
  );

  if (existing) {
    return existing;
  }

  return workspaceRepository.create({
    ownerId: TEST_OWNER_ID.toString(),
    name: "DigitAuth Test Workspace",
  });
}
