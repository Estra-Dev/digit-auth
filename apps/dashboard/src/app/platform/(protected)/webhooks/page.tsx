const code = {
  express: `import express from "express";
import { createHmac, timingSafeEqual } from "node:crypto";

const app = express();
const signingSecret = process.env.DIGITAUTH_WEBHOOK_SECRET!;

app.post(
  "/webhooks/digit-auth",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const timestamp = req.header("digitauth-timestamp");
    const signature = req.header("digitauth-signature");

    if (!timestamp || !signature || !Buffer.isBuffer(req.body)) {
      return res.sendStatus(400);
    }

    // Reject stale deliveries to reduce replay risk.
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > 300) {
      return res.sendStatus(400);
    }

    const expected =
      "sha256=" +
      createHmac("sha256", signingSecret)
        .update(timestamp + "." + req.body.toString("utf8"), "utf8")
        .digest("hex");

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);

    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return res.sendStatus(401);
    }

    const event = JSON.parse(req.body.toString("utf8"));

    switch (event.type) {
      case "user.created":
        // Handle a newly created user.
        break;
      case "user.email_verified":
        // Handle a verified email address.
        break;
      default:
        // Ignore event types your app does not use.
        break;
    }

    return res.sendStatus(200);
  }
);`,
  envelope: `{
  "id": "delivery_event_id",
  "type": "user.created",
  "createdAt": "2026-01-01T12:00:00.000Z",
  "data": {
    "...": "event-specific payload"
  }
}`,
  headers: `digitauth-event
digitauth-delivery
digitauth-timestamp
digitauth-signature`,
};

function CodePanel({
  title,
  children,
}: {
  title: string;
  children: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--site-border)] bg-slate-950">
      <div className="border-b border-white/10 px-4 py-3 text-xs font-medium text-slate-300">
        {title}
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-6 text-blue-100 sm:text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function SectionTitle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-sm font-semibold text-blue-400">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-semibold text-[var(--site-text)]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--site-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function WebhooksPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 px-5 py-8 sm:px-8 sm:py-10">
      <header className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-[var(--site-surface)] to-[var(--site-bg)] p-6 sm:p-9">
        <div className="mb-4 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
          Developer documentation
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--site-text)] sm:text-4xl">
          Webhooks
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--site-muted)] sm:text-base">
          Receive authentication events in your application, verify that
          requests came from DigitAuth, and process them securely.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {["HMAC-SHA256", "Signed requests", "Automatic retries"].map((item) => (
            <span
              key={item}
              className="rounded-lg border border-[var(--site-border)] bg-[var(--site-bg)] px-3 py-2 text-xs text-[var(--site-muted)]"
            >
              {item}
            </span>
          ))}
        </div>
      </header>

      <section>
        <SectionTitle
          number="01"
          title="Configure an endpoint"
          description="Set up the URL that should receive events for your application."
        />
        <div className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-[var(--site-muted)] marker:text-blue-400">
            <li>Open your DigitAuth platform dashboard and select an application.</li>
            <li>In its Webhooks section, enter your publicly reachable endpoint URL and save.</li>
            <li>
              Store the signing secret securely when it is provided. If you
              rotate it, update your receiver immediately because the previous
              secret stops working.
            </li>
            <li>Register a test user in your application and check your receiver logs.</li>
          </ol>
          <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-5 text-[var(--site-muted)]">
            Keep the signing secret on your server. Never expose it in frontend
            JavaScript, public repositories, or client-side environment variables.
          </p>
        </div>
      </section>

      <section>
        <SectionTitle
          number="02"
          title="Supported events"
          description="DigitAuth currently supports these authentication events."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
            <code className="text-sm font-semibold text-blue-400">user.created</code>
            <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">
              Sent when a user is created. The payload includes the user ID,
              application ID, name fields, email, email verification status,
              and creation time.
            </p>
          </article>
          <article className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
            <code className="text-sm font-semibold text-blue-400">user.email_verified</code>
            <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">
              Sent when a user's email address is verified. The payload
              includes user details, a verified status, and verification time.
            </p>
          </article>
        </div>
        <div className="mt-4">
          <CodePanel title="Example event envelope">{code.envelope}</CodePanel>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--site-muted)]">
          The example shows the envelope shape; actual values and data fields
          depend on the event. Treat the payload as untrusted until the signature
          has been verified.
        </p>
      </section>

      <section>
        <SectionTitle
          number="03"
          title="Verify the signature"
          description="Verify the original request bytes before parsing or acting on the payload. This example uses Node.js and Express."
        />
        <div className="mb-4 rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
          <p className="text-sm leading-6 text-[var(--site-muted)]">
            DigitAuth signs the timestamp and exact raw body using HMAC-SHA256.
            The signature header has the form{" "}
            <code className="text-blue-400">sha256=hex_digest</code>. The
            receiver should check timestamp freshness and use a
            constant-time comparison.
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">
            Install Express with <code className="text-blue-400">npm install express</code>.
            Set <code className="text-blue-400">DIGITAUTH_WEBHOOK_SECRET</code>{" "}
            in your server environment to the signing secret for your application.
          </p>
        </div>
        <CodePanel title="server.js — illustrative receiver">{code.express}</CodePanel>
        <p className="mt-3 text-xs leading-5 text-[var(--site-muted)]">
          Register this raw-body route before any general JSON body parser that
          would consume the request body. Add your own error handling and
          durable processing before acknowledging events in production.
        </p>
      </section>

      <section>
        <SectionTitle
          number="04"
          title="Request headers"
          description="Use these headers for routing, verification, and delivery tracking."
        />
        <div className="overflow-hidden rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)]">
          {[
            ["digitauth-event", "Event name, such as user.created."],
            ["digitauth-delivery", "Unique identifier for the delivery event."],
            ["digitauth-timestamp", "Unix timestamp in seconds used in the signature."],
            ["digitauth-signature", "HMAC signature in sha256=... format."],
          ].map(([name, description]) => (
            <div
              key={name}
              className="grid gap-1 border-b border-[var(--site-border)] p-4 last:border-b-0 sm:grid-cols-[230px_1fr] sm:gap-4"
            >
              <code className="break-all text-xs text-blue-400">{name}</code>
              <p className="text-sm leading-6 text-[var(--site-muted)]">{description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <CodePanel title="Header names">{code.headers}</CodePanel>
        </div>
      </section>

      <section>
        <SectionTitle
          number="05"
          title="Delivery and retries"
          description="Design your receiver to handle failures and repeated events safely."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["10 seconds", "A delivery request times out after 10 seconds."],
            ["HTTP 2xx", "Return a 2xx status to acknowledge successful receipt. Other statuses are treated as failures."],
            ["Up to 8 attempts", "Failed deliveries are retried with exponential backoff, starting at 1 second and capped at 1 hour."],
            ["No redirects", "Redirect responses are treated as failures. Configure the final endpoint URL directly."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5"
            >
              <h3 className="text-sm font-semibold text-[var(--site-text)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">{description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--site-text)]">Production checklist</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--site-muted)] marker:text-blue-400">
            <li>Verify the signature before trusting the event.</li>
            <li>Reject timestamps outside your allowed freshness window.</li>
            <li>Make processing idempotent; record the event ID so repeated deliveries do not repeat side effects.</li>
            <li>Return a 2xx response only after you have safely accepted the event for processing.</li>
            <li>Keep secrets and request logs free of sensitive values.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
