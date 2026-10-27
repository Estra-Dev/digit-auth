import { createHmac } from "node:crypto";
import { lookup } from "node:dns/promises";
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

import { deliverWebhookEvent } from "../../../modules/webhook/service/webhook-delivery.service.js";

const signingSecret = "test-webhook-signing-secret";

type MockResponse = EventEmitter & {
  statusCode: number;
  resume: () => void;
};

function mockHttpResponse(statusCode: number) {
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

beforeEach(() => {
  vi.mocked(lookup).mockImplementation(
    async () => [{ address: "93.184.216.34", family: 4 }] as never,
  );
  transport.request.mockReset();
  configureTransport();
});

afterEach(() => {
  vi.clearAllMocks();
});

async function createDeliveryFixture(
  attempts = 1,
  claimToken = "test-claim-token",
) {
  const ownerId = new Types.ObjectId();

  const workspace = await workspaceRepository.create({
    ownerId: ownerId.toString(),
    name: "Webhook Delivery Test Workspace",
  });

  const created = await applicationService.createApplication(
    workspace.id,
    "Webhook Delivery Test Application",
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
    claimToken,
    resourceId: new Types.ObjectId(),
    payload: {
      id: new Types.ObjectId().toString(),
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    },
    status: "processing",
    attempts,
    nextAttemptAt: new Date(),
    lockedAt: new Date(),
  });

  return { event: event.toObject() };
}

describe("Webhook delivery service", () => {
  it("sends a signed webhook and marks the event delivered", async () => {
    const { event } = await createDeliveryFixture();

    let sentBody = "";
    let sentHeaders: Record<string, string> = {};

    transport.request.mockImplementation((_url, options, callback) => {
      sentHeaders = options.headers;
      const request = Object.assign(new EventEmitter(), {
        setTimeout: vi.fn(),
        destroy(error?: Error) {
          if (error) request.emit("error", error);
          return request;
        },
        end(body: string) {
          sentBody = body;
          callback(mockHttpResponse(204));
        },
      });
      return request;
    });

    await deliverWebhookEvent(event);

    expect(transport.request).toHaveBeenCalledTimes(1);

    const [requestUrl, requestOptions] = transport.request.mock.calls[0] as [
      URL,
      { method: string; headers: Record<string, string> },
      (response: MockResponse) => void,
    ];

    expect(requestUrl.toString()).toBe("https://webhook.example.com/events");
    expect(requestOptions.method).toBe("POST");
    expect(sentHeaders["content-type"]).toBe("application/json");
    expect(sentHeaders["user-agent"]).toBe("DigitAuth-Webhooks/1.0");
    expect(sentHeaders["digitauth-event"]).toBe("user.created");
    expect(sentHeaders["digitauth-delivery"]).toBe(event._id.toString());

    const timestamp = sentHeaders["digitauth-timestamp"];
    const signature = sentHeaders["digitauth-signature"];
    const expectedSignature = createHmac("sha256", signingSecret)
      .update(`${timestamp}.${sentBody}`, "utf8")
      .digest("hex");

    expect(signature).toBe(`sha256=${expectedSignature}`);

    const parsedBody = JSON.parse(sentBody);
    expect(parsedBody.id).toBe(event._id.toString());
    expect(parsedBody.type).toBe("user.created");
    expect(parsedBody.data.email).toBe("test@example.com");

    const storedEvent = await WebhookEvent.findById(event._id);
    expect(storedEvent?.status).toBe("delivered");
    expect(storedEvent?.deliveredAt).toBeInstanceOf(Date);
    expect(storedEvent?.lockedAt).toBeNull();
    expect(storedEvent?.lastError).toBeNull();
  });

  it("schedules a retry when the endpoint returns HTTP 500", async () => {
    const { event } = await createDeliveryFixture();
    configureTransport(500);

    await deliverWebhookEvent(event);

    const storedEvent = await WebhookEvent.findById(event._id);
    expect(transport.request).toHaveBeenCalledTimes(1);
    expect(storedEvent?.status).toBe("pending");
    expect(storedEvent?.attempts).toBe(1);
    expect(storedEvent?.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
    expect(storedEvent?.lockedAt).toBeNull();
    expect(storedEvent?.lastError).toContain("HTTP 500");
  });

  it("marks the event failed after the maximum attempts", async () => {
    const { event } = await createDeliveryFixture(8);
    configureTransport(503);

    await deliverWebhookEvent(event);

    const storedEvent = await WebhookEvent.findById(event._id);
    expect(storedEvent?.status).toBe("failed");
    expect(storedEvent?.attempts).toBe(8);
    expect(storedEvent?.lockedAt).toBeNull();
    expect(storedEvent?.lastError).toContain("HTTP 503");
  });

  it("does not follow endpoint redirects", async () => {
    const { event } = await createDeliveryFixture();
    configureTransport(302);

    await deliverWebhookEvent(event);

    expect(transport.request).toHaveBeenCalledTimes(1);

    const storedEvent = await WebhookEvent.findById(event._id);
    expect(storedEvent?.status).toBe("pending");
    expect(storedEvent?.lastError).toContain("redirect status 302");
  });

  it("does not let a stale claim overwrite a newer delivery attempt", async () => {
    const oldClaimToken = "old-claim-token";
    const newClaimToken = "new-claim-token";

    const { event } = await createDeliveryFixture(1, oldClaimToken);

    let respondToRequest: ((response: MockResponse) => void) | undefined;

    transport.request.mockImplementation((_url, _options, callback) => {
      respondToRequest = callback;

      const request = Object.assign(new EventEmitter(), {
        setTimeout: vi.fn(),
        destroy(error?: Error) {
          if (error) request.emit("error", error);
          return request;
        },
        end: vi.fn(),
      });

      return request;
    });

    const deliveryPromise = deliverWebhookEvent(event);

    await vi.waitFor(() => {
      expect(transport.request).toHaveBeenCalledTimes(1);
    });

    // Simulate another worker recovering and claiming the same event.
    await WebhookEvent.updateOne(
      { _id: event._id },
      {
        $set: {
          status: "processing",
          claimToken: newClaimToken,
          lockedAt: new Date(),
        },
      },
    );

    // The original worker finally receives its successful HTTP response.
    expect(respondToRequest).toBeDefined();
    respondToRequest!(mockHttpResponse(204));

    await deliveryPromise;

    const storedEvent = await WebhookEvent.findById(event._id);

    expect(storedEvent?.status).toBe("processing");
    expect(storedEvent?.claimToken).toBe(newClaimToken);
    expect(storedEvent?.lockedAt).toBeInstanceOf(Date);
    expect(storedEvent?.deliveredAt).toBeNull();
  });

  it("does not let a stale failed delivery overwrite a newer attempt", async () => {
    const oldClaimToken = "old-claim-token";
    const newClaimToken = "new-claim-token";

    const { event } = await createDeliveryFixture(1, oldClaimToken);

    let respondToRequest: ((response: MockResponse) => void) | undefined;

    transport.request.mockImplementation((_url, _options, callback) => {
      respondToRequest = callback;

      const request = Object.assign(new EventEmitter(), {
        setTimeout: vi.fn(),
        destroy(error?: Error) {
          if (error) request.emit("error", error);
          return request;
        },
        end: vi.fn(),
      });

      return request;
    });

    const deliveryPromise = deliverWebhookEvent(event);

    await vi.waitFor(() => {
      expect(transport.request).toHaveBeenCalledTimes(1);
    });

    await WebhookEvent.updateOne(
      { _id: event._id },
      {
        $set: {
          status: "processing",
          claimToken: newClaimToken,
          lockedAt: new Date(),
        },
      },
    );

    expect(respondToRequest).toBeDefined();
    respondToRequest!(mockHttpResponse(500));

    await deliveryPromise;

    const storedEvent = await WebhookEvent.findById(event._id);

    expect(storedEvent?.status).toBe("processing");
    expect(storedEvent?.claimToken).toBe(newClaimToken);
    expect(storedEvent?.lockedAt).toBeInstanceOf(Date);
    expect(storedEvent?.lastError).toBeNull();
  });
});
