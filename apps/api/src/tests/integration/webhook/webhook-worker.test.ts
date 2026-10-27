import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const deliveryMock = vi.hoisted(() => ({
  deliverWebhookEvent: vi.fn(),
}));

vi.mock("../../../modules/webhook/service/webhook-delivery.service.js", () => ({
  deliverWebhookEvent: deliveryMock.deliverWebhookEvent,
}));

import WebhookEvent from "../../../modules/webhook/model/webhook-event.model.js";
import {
  claimNextWebhookEvent,
  recoverStaleWebhookEvents,
  startWebhookWorker,
  stopWebhookWorker,
} from "../../../modules/webhook/service/webhook-worker.service.js";

const MAX_ATTEMPTS = 8;
const STALE_LOCK_MS = 5 * 60 * 1000;

async function createEvent(
  overrides: Partial<{
    status: "pending" | "processing" | "delivered" | "failed";
    attempts: number;
    nextAttemptAt: Date;
    lockedAt: Date | null;
    lastError: string | null;
  }> = {},
) {
  return WebhookEvent.create({
    applicationId: new Types.ObjectId(),
    event: "user.created",
    resourceId: new Types.ObjectId(),
    payload: {
      id: new Types.ObjectId().toString(),
      email: "worker-test@example.com",
    },
    status: "pending",
    attempts: 0,
    nextAttemptAt: new Date(Date.now() - 1_000),
    lockedAt: null,
    ...overrides,
  });
}

describe("Webhook worker service", () => {
  beforeEach(async () => {
    await stopWebhookWorker();
    deliveryMock.deliverWebhookEvent.mockReset();
    deliveryMock.deliverWebhookEvent.mockResolvedValue(undefined);
    await WebhookEvent.deleteMany({});
  });

  it("claims an eligible pending event and increments attempts", async () => {
    const event = await createEvent();

    const claimed = await claimNextWebhookEvent();

    expect(claimed).not.toBeNull();
    expect(claimed?._id.toString()).toBe(event._id.toString());
    expect(claimed?.status).toBe("processing");
    expect(claimed?.attempts).toBe(1);
    expect(claimed?.lockedAt).toBeInstanceOf(Date);

    const stored = await WebhookEvent.findById(event._id);
    expect(stored?.status).toBe("processing");
    expect(stored?.attempts).toBe(1);
  });

  it("does not claim events scheduled for the future", async () => {
    await createEvent({
      nextAttemptAt: new Date(Date.now() + 60_000),
    });

    const claimed = await claimNextWebhookEvent();

    expect(claimed).toBeNull();
  });

  it("does not claim events that have exhausted their attempts", async () => {
    await createEvent({
      attempts: MAX_ATTEMPTS,
    });

    const claimed = await claimNextWebhookEvent();

    expect(claimed).toBeNull();
  });

  it("recovers stale processing events back to pending", async () => {
    const staleLock = new Date(Date.now() - STALE_LOCK_MS - 10_000);

    const event = await createEvent({
      status: "processing",
      attempts: 2,
      lockedAt: staleLock,
    });

    await recoverStaleWebhookEvents();

    const recovered = await WebhookEvent.findById(event._id);

    expect(recovered?.status).toBe("pending");
    expect(recovered?.lockedAt).toBeNull();
    expect(recovered?.nextAttemptAt.getTime()).toBeGreaterThanOrEqual(
      Date.now() - 2_000,
    );
    expect(recovered?.lastError).toContain("Previous delivery worker stopped");
  });

  it("marks stale events failed when their attempts are exhausted", async () => {
    const staleLock = new Date(Date.now() - STALE_LOCK_MS - 10_000);

    const event = await createEvent({
      status: "processing",
      attempts: MAX_ATTEMPTS,
      lockedAt: staleLock,
    });

    await recoverStaleWebhookEvents();

    const recovered = await WebhookEvent.findById(event._id);

    expect(recovered?.status).toBe("failed");
    expect(recovered?.lockedAt).toBeNull();
    expect(recovered?.lastError).toContain("Previous delivery worker stopped");
  });

  it("does not recover processing events with a recent lock", async () => {
    const event = await createEvent({
      status: "processing",
      attempts: 1,
      lockedAt: new Date(),
    });

    await recoverStaleWebhookEvents();

    const unchanged = await WebhookEvent.findById(event._id);

    expect(unchanged?.status).toBe("processing");
    expect(unchanged?.lockedAt).not.toBeNull();
  });

  it("automatically claims a queued event and passes it to delivery", async () => {
    const event = await createEvent();

    try {
      startWebhookWorker();

      await vi.waitFor(
        () => {
          expect(deliveryMock.deliverWebhookEvent).toHaveBeenCalledTimes(1);
        },
        { timeout: 10_000, interval: 100 },
      );

      const deliveredEvent =
        deliveryMock.deliverWebhookEvent.mock.calls[0]?.[0];

      expect(deliveredEvent?._id.toString()).toBe(event._id.toString());

      const stored = await WebhookEvent.findById(event._id);
      expect(stored?.status).toBe("processing");
      expect(stored?.attempts).toBe(1);
      expect(stored?.lockedAt).toBeInstanceOf(Date);
    } finally {
      await stopWebhookWorker();
    }
  });
});
