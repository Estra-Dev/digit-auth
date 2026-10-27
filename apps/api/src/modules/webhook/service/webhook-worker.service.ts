import WebhookEvent from "../model/webhook-event.model.js";
import { logger } from "../../../config/logger.js";
import { deliverWebhookEvent } from "./webhook-delivery.service.js";
import { randomUUID } from "node:crypto";

const LOCK_TIMEOUT_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 1_000;
const RECOVERY_INTERVAL_MS = 60_000;

let stopRequested = false;
let workerPromise: Promise<void> | null = null;

export async function recoverStaleWebhookEvents(): Promise<void> {
  const staleBefore = new Date(Date.now() - LOCK_TIMEOUT_MS);

  await WebhookEvent.updateMany(
    {
      status: "processing",
      lockedAt: { $lte: staleBefore },
    },
    [
      {
        $set: {
          status: {
            $cond: [{ $gte: ["$attempts", MAX_ATTEMPTS] }, "failed", "pending"],
          },
          nextAttemptAt: new Date(),
          lockedAt: null,
          claimToken: null,
          lastError: "Previous delivery worker stopped before completing.",
        },
      },
    ],
    { updatePipeline: true },
  );
}

export async function claimNextWebhookEvent() {
  const now = new Date();

  return WebhookEvent.findOneAndUpdate(
    {
      status: "pending",
      nextAttemptAt: { $lte: now },
      attempts: { $lt: MAX_ATTEMPTS },
    },
    {
      $set: {
        status: "processing",
        lockedAt: now,
        claimToken: randomUUID(),
      },
      $inc: {
        attempts: 1,
      },
    },
    {
      sort: { nextAttemptAt: 1, createdAt: 1 },
      returnDocument: "after",
      upsert: false,
    },
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWebhookWorker(): Promise<void> {
  let lastRecoveryAt = 0;

  logger.info("Webhook worker started.");

  while (!stopRequested) {
    try {
      if (Date.now() - lastRecoveryAt >= RECOVERY_INTERVAL_MS) {
        await recoverStaleWebhookEvents();
        lastRecoveryAt = Date.now();
      }

      const event = await claimNextWebhookEvent();

      if (event) {
        await deliverWebhookEvent(event);
        continue;
      }
    } catch (error) {
      logger.error({ err: error }, "Webhook worker iteration failed.");
    }

    await sleep(POLL_INTERVAL_MS);
  }

  logger.info("Webhook worker stopped.");
}

export function startWebhookWorker(): void {
  if (workerPromise) {
    return;
  }

  stopRequested = false;

  workerPromise = runWebhookWorker().finally(() => {
    workerPromise = null;
  });
}

export async function stopWebhookWorker(): Promise<void> {
  stopRequested = true;

  if (workerPromise) {
    await workerPromise;
  }
}
