import { EventEmitter } from "node:events";
import { Types } from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Application } from "../../../modules/application/model/application.model.js";
import { applicationService } from "../../../modules/application/index.js";
import { workspaceRepository } from "../../../modules/workspace/index.js";
import WebhookEvent from "../../../modules/webhook/model/webhook-event.model.js";
import { encryptWebhookSecret } from "../../../modules/webhook/service/webhook-secret.service.js";

const transport = vi.hoisted(() => ({
  request: vi.fn(),
}));

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(),
}));

vi.mock("node:https", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:https")>();
  return { ...actual, request: transport.request };
});

vi.mock("node:http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:http")>();
  return { ...actual, request: transport.request };
});

import { lookup } from "node:dns/promises";
import { deliverWebhookEvent } from "../../../modules/webhook/service/webhook-delivery.service.js";
import {
  startWebhookWorker,
  stopWebhookWorker,
} from "../../../modules/webhook/service/webhook-worker.service.js";

const signingSecret = "test-webhook-signing-secret";

type MockResponse = EventEmitter & {
  statusCode: number;
  resume: () => void;
};

function mockHttpResponse(statusCode: number): MockResponse {
  const response = Object.assign(new EventEmitter(), {
    statusCode,
    resume() {
      queueMicrotask(() => response.emit("end"));
    },
  }) as MockResponse;

  return response;
}

function configureTransport(statusCode = 204) {
  transport.request.mockImplementation((_url, _options, callback) => {
    const request = Object.assign(new EventEmitter(), {
      setTimeout: vi.fn(),
      destroy(error?: Error) {
        if (error) request.emit("error", error);
        return request;
      },
      end: vi.fn(() => {
        callback(mockHttpResponse(statusCode));
      }),
    });

    return request;
  });
}

async function createQueuedEvent() {
  const ownerId = new Types.ObjectId();

  const workspace = await workspaceRepository.create({
    ownerId: ownerId.toString(),
    name: "Webhook Worker Delivery Test Workspace",
  });

  const created = await applicationService.createApplication(
    workspace.id,
    "Webhook Worker Delivery Test Application",
  );

  const applicationId = new Types.ObjectId(created.application.id);

  await Application.updateOne(
    { _id: applicationId },
    {
      $set: {
        webhookUrl: "https://webhook.example.com/events",
        webhookSecretEncrypted: encryptWebhookSecret(signingSecret),
      },
    },
  );

  const event = await WebhookEvent.create({
    applicationId,
    event: "user.created",
    resourceId: new Types.ObjectId(),
    payload: {
      id: new Types.ObjectId().toString(),
      email: "worker-delivery@example.com",
      firstName: "Worker",
      lastName: "Test",
    },
    status: "pending",
    attempts: 0,
    nextAttemptAt: new Date(Date.now() - 1_000),
    lockedAt: null,
  });

  return event;
}

describe("Webhook worker and delivery integration", () => {
  beforeEach(async () => {
    await stopWebhookWorker();

    vi.mocked(lookup).mockImplementation(
      async () => [{ address: "93.184.216.34", family: 4 }] as never,
    );

    transport.request.mockReset();
    configureTransport();

    await WebhookEvent.deleteMany({});
  });

  afterEach(async () => {
    await stopWebhookWorker();
    vi.clearAllMocks();
  });

  it("claims a queued event, delivers it, and marks it delivered", async () => {
    const event = await createQueuedEvent();

    try {
      startWebhookWorker();

      await vi.waitFor(
        async () => {
          const stored = await WebhookEvent.findById(event._id);
          expect(stored?.status).toBe("delivered");
        },
        { timeout: 15_000, interval: 100 },
      );
    } finally {
      await stopWebhookWorker();
    }

    expect(transport.request).toHaveBeenCalledTimes(1);

    const stored = await WebhookEvent.findById(event._id);

    expect(stored?.status).toBe("delivered");
    expect(stored?.attempts).toBe(1);
    expect(stored?.deliveredAt).toBeInstanceOf(Date);
    expect(stored?.lockedAt).toBeNull();
    expect(stored?.lastError).toBeNull();

    expect(deliverWebhookEvent).toBeDefined();
  });
});
