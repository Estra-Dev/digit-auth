import { createHmac } from "node:crypto";
import { lookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";
import type { LookupFunction } from "node:net";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { IncomingMessage, RequestOptions } from "node:http";
import { isIP } from "node:net";

import { Application } from "../../application/model/application.model.js";
import WebhookEvent from "../model/webhook-event.model.js";
import { decryptWebhookSecret } from "./webhook-secret.service.js";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 8;
const MAX_ERROR_LENGTH = 1_000;
const BASE_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 60 * 60 * 1_000;
const USER_AGENT = "DigitAuth-Webhooks/1.0";

type WebhookEventRecord = {
  _id: { toString(): string };
  applicationId: { toString(): string };
  event: string;
  payload: Record<string, unknown>;
  attempts: number;
  claimToken: string | null;
};

type SafeDestination = {
  url: URL;
  addresses: LookupAddress[];
};

function ipv4ToNumber(address: string): number | null {
  const parts = address.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null;
  }

  return (
    (((parts[0]! * 256 + parts[1]!) * 256 + parts[2]!) * 256 + parts[3]!) >>> 0
  );
}

function isIPv4InRange(
  address: string,
  network: string,
  prefix: number,
): boolean {
  const ip = ipv4ToNumber(address);
  const base = ipv4ToNumber(network);

  if (ip === null || base === null) {
    return true;
  }

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;

  return (ip & mask) === (base & mask);
}

function isBlockedIPv4(address: string): boolean {
  if (ipv4ToNumber(address) === null) {
    return true;
  }

  const blockedRanges: Array<[string, number]> = [
    ["0.0.0.0", 8],
    ["10.0.0.0", 8],
    ["100.64.0.0", 10],
    ["127.0.0.0", 8],
    ["169.254.0.0", 16],
    ["172.16.0.0", 12],
    ["192.0.0.0", 24],
    ["192.0.2.0", 24],
    ["192.88.99.0", 24],
    ["192.168.0.0", 16],
    ["198.18.0.0", 15],
    ["198.51.100.0", 24],
    ["203.0.113.0", 24],
    ["224.0.0.0", 4],
    ["240.0.0.0", 4],
  ];

  return blockedRanges.some(([network, prefix]) =>
    isIPv4InRange(address, network, prefix),
  );
}

function ipv6ToBigInt(address: string): bigint | null {
  let input = address.toLowerCase().split("%")[0] ?? "";

  if (!input || input.includes(".")) {
    return null;
  }

  const doubleColonParts = input.split("::");

  if (doubleColonParts.length > 2) {
    return null;
  }

  const parseSide = (side: string): number[] | null => {
    if (!side) {
      return [];
    }

    const parts = side.split(":");
    const values: number[] = [];

    for (const part of parts) {
      if (!/^[0-9a-f]{1,4}$/.test(part)) {
        return null;
      }

      values.push(Number.parseInt(part, 16));
    }

    return values;
  };

  const left = parseSide(doubleColonParts[0] ?? "");
  const right = parseSide(doubleColonParts[1] ?? "");

  if (!left || !right) {
    return null;
  }

  let groups: number[];

  if (doubleColonParts.length === 2) {
    const missing = 8 - left.length - right.length;

    if (missing < 1) {
      return null;
    }

    groups = [...left, ...Array<number>(missing).fill(0), ...right];
  } else {
    if (left.length !== 8) {
      return null;
    }

    groups = left;
  }

  if (groups.length !== 8) {
    return null;
  }

  input = "";

  return groups.reduce((result, group) => (result << 16n) | BigInt(group), 0n);
}

function ipv6InRange(
  address: bigint,
  network: bigint,
  prefix: number,
): boolean {
  const shift = BigInt(128 - prefix);

  return address >> shift === network >> shift;
}

function isBlockedIPv6(address: string): boolean {
  const ip = ipv6ToBigInt(address);

  if (ip === null) {
    return true;
  }

  const ranges: Array<[string, number]> = [
    ["::", 128],
    ["::1", 128],
    ["::ffff:0:0", 96],
    ["64:ff9b::", 96],
    ["64:ff9b:1::", 48],
    ["100::", 64],
    ["2001::", 23],
    ["2001:db8::", 32],
    ["2002::", 16],
    ["fc00::", 7],
    ["fe80::", 10],
    ["ff00::", 8],
  ];

  // Accept only global-unicast IPv6 addresses within 2000::/3,
  // excluding special-purpose, transition, and documentation ranges.
  if (!ipv6InRange(ip, ipv6ToBigInt("2000::")!, 3)) {
    return true;
  }

  return ranges.some(([network, prefix]) =>
    ipv6InRange(ip, ipv6ToBigInt(network)!, prefix),
  );
}

function isBlockedAddress(address: string): boolean {
  const version = isIP(address);

  if (version === 4) {
    return isBlockedIPv4(address);
  }

  if (version === 6) {
    return isBlockedIPv6(address);
  }

  return true;
}

async function resolveSafeDestination(
  rawUrl: string,
): Promise<SafeDestination> {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Webhook URL is invalid.");
  }

  if (url.username || url.password) {
    throw new Error("Webhook URLs must not contain credentials.");
  }

  if (url.hostname.endsWith(".")) {
    throw new Error("Webhook hostnames with trailing dots are not allowed.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const ipVersion = isIP(hostname);
  const isLocalhost =
    hostname === "localhost" || hostname.endsWith(".localhost");

  if (url.protocol !== "https:") {
    const localDevelopment =
      process.env.NODE_ENV === "development" &&
      url.protocol === "http:" &&
      (isLocalhost ||
        (ipVersion === 4 && hostname === "127.0.0.1") ||
        (ipVersion === 6 && hostname === "::1"));

    if (!localDevelopment) {
      throw new Error("Webhook delivery requires HTTPS.");
    }
  }

  if (isLocalhost) {
    if (
      process.env.NODE_ENV !== "development" ||
      url.protocol !== "http:" ||
      hostname !== "localhost"
    ) {
      throw new Error("Local webhook destinations are not allowed.");
    }

    const records = await lookup(hostname, { all: true, verbatim: true });

    if (
      records.length === 0 ||
      records.some(
        (record) => record.address !== "127.0.0.1" && record.address !== "::1",
      )
    ) {
      throw new Error("Local webhook hostname resolved to an unsafe address.");
    }

    return { url, addresses: records };
  }

  if (ipVersion !== 0) {
    if (
      isBlockedAddress(hostname) &&
      !(
        process.env.NODE_ENV === "development" &&
        url.protocol === "http:" &&
        (hostname === "127.0.0.1" || hostname === "::1")
      )
    ) {
      throw new Error(
        "Webhook destination resolves to a prohibited IP address.",
      );
    }

    return {
      url,
      addresses: [{ address: hostname, family: ipVersion }],
    };
  }

  let records: LookupAddress[];

  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error("Webhook hostname could not be resolved.");
  }

  if (
    records.length === 0 ||
    records.some((record) => isBlockedAddress(record.address))
  ) {
    throw new Error("Webhook destination resolves to a prohibited IP address.");
  }

  return { url, addresses: records };
}

function createPinnedLookup(addresses: LookupAddress[]): LookupFunction {
  if (addresses.length === 0) {
    throw new Error(
      "Cannot pin a webhook destination without resolved IP addresses.",
    );
  }

  return ((
    _hostname: string,
    options: number | { all?: boolean; family?: number },
    callback: (...args: never[]) => void,
  ) => {
    const requestedFamily =
      typeof options === "number" ? options : (options.family ?? 0);

    const matchingAddresses =
      requestedFamily === 0
        ? addresses
        : addresses.filter((address) => address.family === requestedFamily);

    if (matchingAddresses.length === 0) {
      const error = Object.assign(
        new Error(
          "No vetted webhook IP address matches the requested address family.",
        ),
        { code: "ENOTFOUND" },
      );

      (callback as (error: NodeJS.ErrnoException) => void)(error);
      return;
    }

    if (typeof options === "object" && options.all) {
      (
        callback as (
          error: NodeJS.ErrnoException | null,
          addresses: LookupAddress[],
        ) => void
      )(null, matchingAddresses);

      return;
    }

    const record = matchingAddresses[0]!;

    (
      callback as (
        error: NodeJS.ErrnoException | null,
        address: string,
        family: number,
      ) => void
    )(null, record.address, record.family);
  }) as LookupFunction;
}

function createSignature(
  secret: string,
  timestamp: string,
  body: string,
): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");
}

function getRetryDelayMs(attempts: number): number {
  const exponent = Math.max(0, attempts - 1);
  const delay = BASE_RETRY_DELAY_MS * 2 ** Math.min(exponent, 20);

  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

async function markDeliveryFailed(
  eventRecord: WebhookEventRecord,
  error: unknown,
): Promise<void> {
  const message =
    error instanceof Error ? error.message : "Unknown webhook delivery error.";

  const exhausted = eventRecord.attempts >= MAX_ATTEMPTS;

  await WebhookEvent.updateOne(
    {
      _id: eventRecord._id,
      status: "processing",
      claimToken: eventRecord.claimToken,
    },
    {
      $set: {
        status: exhausted ? "failed" : "pending",
        nextAttemptAt: new Date(
          Date.now() + getRetryDelayMs(eventRecord.attempts),
        ),
        lockedAt: null,
        claimToken: null,
        lastError: message.slice(0, MAX_ERROR_LENGTH),
      },
    },
  );
}

function sendRequest(
  destination: SafeDestination,
  headers: Record<string, string>,
  body: string,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const { url, addresses } = destination;
    const requestFunction =
      url.protocol === "https:" ? httpsRequest : httpRequest;

    const requestOptions: RequestOptions = {
      method: "POST",
      headers,
      lookup: createPinnedLookup(addresses),
      ...(url.protocol === "https:" ? { servername: url.hostname } : {}),
    };

    let settled = false;

    const finish = (error?: Error, statusCode?: number) => {
      if (settled) {
        return;
      }

      settled = true;

      if (error) {
        reject(error);
      } else {
        resolve(statusCode ?? 0);
      }
    };

    const request = requestFunction(
      url,
      requestOptions,
      (response: IncomingMessage) => {
        response.on("error", (error) => finish(error));
        response.on("end", () => finish(undefined, response.statusCode ?? 0));
        response.resume();
      },
    );

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error("Webhook request timed out."));
    });

    request.on("error", (error) => finish(error));
    request.end(body);
  });
}

export async function deliverWebhookEvent(
  eventRecord: WebhookEventRecord,
): Promise<void> {
  try {
    const application = await Application.findById(eventRecord.applicationId)
      .select("+webhookSecretEncrypted")
      .lean();

    if (!application?.webhookUrl || !application.webhookSecretEncrypted) {
      throw new Error("Webhook endpoint or signing secret is not configured.");
    }

    const destination = await resolveSafeDestination(application.webhookUrl);
    const secret = decryptWebhookSecret(application.webhookSecretEncrypted);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const body = JSON.stringify({
      id: eventRecord._id.toString(),
      type: eventRecord.event,
      createdAt: new Date().toISOString(),
      data: eventRecord.payload,
    });

    const signature = createSignature(secret, timestamp, body);

    const statusCode = await sendRequest(
      destination,
      {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(body).toString(),
        "user-agent": USER_AGENT,
        "digitauth-event": eventRecord.event,
        "digitauth-delivery": eventRecord._id.toString(),
        "digitauth-timestamp": timestamp,
        "digitauth-signature": `sha256=${signature}`,
        host: destination.url.host,
      },
      body,
    );

    if (statusCode >= 300 && statusCode < 400) {
      throw new Error(
        `Webhook endpoint returned redirect status ${statusCode}.`,
      );
    }

    if (statusCode < 200 || statusCode >= 300) {
      throw new Error(`Webhook endpoint returned HTTP ${statusCode}.`);
    }

    await WebhookEvent.updateOne(
      {
        _id: eventRecord._id,
        status: "processing",
        claimToken: eventRecord.claimToken,
      },
      {
        $set: {
          status: "delivered",
          deliveredAt: new Date(),
          lockedAt: null,
          lastError: null,
          claimToken: null,
        },
      },
    );
  } catch (error) {
    await markDeliveryFailed(eventRecord, error);
  }
}
