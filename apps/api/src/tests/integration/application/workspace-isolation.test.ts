import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import { applicationRepository } from "../../../modules/application/index.js";
import { applicationService } from "../../../modules/application/index.js";
import { workspaceRepository } from "../../../modules/workspace/index.js";

describe("Application workspace isolation", () => {
  it("does not allow one workspace to access another workspace's application", async () => {
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

    const created = await applicationService.createApplication(
      workspaceB.id,
      "Workspace B Application",
    );

    await expect(
      applicationService.getApplication(workspaceA.id, created.application.id),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("does not allow one workspace to suspend another workspace's application", async () => {
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

    const created = await applicationService.createApplication(
      workspaceB.id,
      "Workspace B Application",
    );

    await expect(
      applicationService.suspendApplication(
        workspaceA.id,
        created.application.id,
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
    });

    const application = await applicationRepository.findById(
      created.application.id,
    );

    expect(application?.status).toBe("ACTIVE");
  });

  it("does not allow one workspace to activate another workspace's application", async () => {
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

    const created = await applicationService.createApplication(
      workspaceB.id,
      "Workspace B Application",
    );

    await applicationService.suspendApplication(
      workspaceB.id,
      created.application.id,
    );

    await expect(
      applicationService.activateApplication(
        workspaceA.id,
        created.application.id,
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
    });

    const application = await applicationRepository.findById(
      created.application.id,
    );

    expect(application?.status).toBe("SUSPENDED");
  });

  it("does not allow one workspace to rotate another workspace's client secret", async () => {
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

    const created = await applicationService.createApplication(
      workspaceB.id,
      "Workspace B Application",
    );

    await expect(
      applicationService.rotateClientSecret(
        workspaceA.id,
        created.application.id,
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
