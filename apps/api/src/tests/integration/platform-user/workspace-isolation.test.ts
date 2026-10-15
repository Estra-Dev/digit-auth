import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import { applicationService } from "../../../modules/application/index.js";
import { User } from "../../../modules/auth/model/user.model.js";
import { platformUserService } from "../../../modules/platform-user/service/platform-user.service.js";
import { workspaceRepository } from "../../../modules/workspace/index.js";

describe("Platform user workspace isolation", () => {
  it("does not list or retrieve users belonging to another workspace", async () => {
    const ownerA = new Types.ObjectId();
    const ownerB = new Types.ObjectId();

    const workspaceA = await workspaceRepository.create({
      ownerId: ownerA.toString(),
      name: "Workspace A",
    });

    const workspaceB = await workspaceRepository.create({
      ownerId: ownerB.toString(),
      name: "Workspace B",
    });

    const applicationA = await applicationService.createApplication(
      workspaceA.id,
      "Workspace A Application",
    );

    const applicationB = await applicationService.createApplication(
      workspaceB.id,
      "Workspace B Application",
    );

    const applicationAId = new Types.ObjectId(applicationA.application.id);
    const applicationBId = new Types.ObjectId(applicationB.application.id);

    const targetUser = await User.create({
      applicationId: applicationBId,
      firstName: "Workspace",
      lastName: "B User",
      email: `workspace-b-${new Types.ObjectId().toString()}@example.com`,
      passwordHashed: "test-password-hash",
    });

    const users = await platformUserService.listUsers([applicationAId]);

    expect(users).toHaveLength(0);

    await expect(
      platformUserService.getUser(
        targetUser._id.toString(),
        [applicationAId],
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
