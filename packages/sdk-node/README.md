# @digit-auth/node

Node.js and Express SDK for DigitAuth authentication and authorization.

The `@digit-auth/node` SDK lets your Express backend authenticate requests through the DigitAuth API, access the authenticated user, and apply role, permission, and resource-ownership checks.

## Features

- Authenticate Express requests with DigitAuth
- Access the authenticated user
- Role-based authorization
- Permission-based authorization
- Resource ownership authorization
- Automatic communication with the DigitAuth API
- TypeScript support
- Express 5 support

## Requirements

Before installing the SDK, make sure you have:

- Node.js 20 or later
- Express 5 or later
- A running DigitAuth API
- A DigitAuth application with a valid client ID and client secret

You can use the SDK in a separate application or backend. Your application does not need to be part of the DigitAuth monorepo.

## Installation

### Install the published package

Install the current published version, `0.1.0`, using pnpm:

```bash
pnpm add @digit-auth/node@0.1.0 express
```

Or using npm:

```bash
npm install @digit-auth/node@0.1.0 express
```

Or using Yarn:

```bash
yarn add @digit-auth/node@0.1.0 express
```

Pinning the version makes the example reproducible. To check which versions are published, run:

```bash
pnpm view @digit-auth/node versions
```

To check the latest published version, run:

```bash
pnpm view @digit-auth/node version
```

If a newer version has been published, update the version in your installation command accordingly.

### Verify the installation

Check that the package is installed:

```bash
pnpm list @digit-auth/node
```

Your application should import the SDK from the public package:

```ts
import { createDigitAuth, requireAuth, getAuth } from "@digit-auth/node";
```

You should not need to copy SDK source files into your application.

## Environment configuration

Configure the connection to your DigitAuth API using environment variables.

Create a `.env` file in your backend project:

```env
DIGIT_AUTH_API_URL=http://localhost:5000/api/v1
DIGIT_AUTH_CLIENT_ID=your_digit_auth_client_id
DIGIT_AUTH_CLIENT_SECRET=your_digit_auth_client_secret
```

Replace the example values with the actual API URL and credentials for your DigitAuth application.

The API URL should point to the versioned API base URL, such as `http://localhost:5000/api/v1`, rather than the dashboard URL.

For production, use your deployed API's HTTPS URL.

**Security notes:**

- Keep `DIGIT_AUTH_CLIENT_SECRET` on the server.
- Never expose the client secret through frontend environment variables or browser code.
- Add `.env` to `.gitignore`.
- Do not commit real credentials to your repository.
- Use HTTPS in production.

## Create the DigitAuth client

Create a module that initializes the SDK once and exports the configured client.

For example, create `src/lib/digit-auth.ts`:

```ts
import { createDigitAuth } from "@digit-auth/node";

const apiUrl = process.env.DIGIT_AUTH_API_URL;
const clientId = process.env.DIGIT_AUTH_CLIENT_ID;
const clientSecret = process.env.DIGIT_AUTH_CLIENT_SECRET;

if (!apiUrl || !clientId || !clientSecret) {
  throw new Error(
    "Missing DigitAuth configuration. Set DIGIT_AUTH_API_URL, " +
      "DIGIT_AUTH_CLIENT_ID, and DIGIT_AUTH_CLIENT_SECRET.",
  );
}

export const digitAuth = createDigitAuth({
  apiUrl,
  clientId,
  clientSecret,
});
```

Load your environment variables before importing this module. If you use `dotenv`, initialize it at your application's entry point:

```ts
import "dotenv/config";
```

The SDK communicates with the DigitAuth API for authentication and authorization-related operations. It does not require your application's code to possess DigitAuth's JWT signing secret.

Your application must still protect its own routes and enforce access rules for its own data.

## Authentication

Use `requireAuth()` to protect an Express route.

The middleware reads the incoming bearer access token, asks the DigitAuth API to validate the authenticated user, and attaches the authentication context to the Express request when authentication succeeds.

Example:

```ts
import express from "express";
import { requireAuth, getAuth } from "@digit-auth/node";
import { digitAuth } from "./lib/digit-auth.js";

const app = express();

app.use(express.json());

app.get("/protected", requireAuth(digitAuth), (req, res) => {
  const authContext = getAuth(req);

  if (!authContext) {
    res.status(401).json({
      error: "Authentication required",
    });
    return;
  }

  res.json({
    message: "Authentication successful",
    user: authContext.user,
  });
});

app.listen(3001, () => {
  console.log("Application server running on port 3001");
});
```

Send an access token in the `Authorization` header when calling the protected endpoint:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

If the token is missing or invalid, the authentication middleware rejects the request.

When authentication succeeds, the SDK attaches an authentication context to `req.auth`. This context contains:

- `user`: the authenticated DigitAuth user
- `accessToken`: the access token associated with the request

Do not treat a client-provided user ID as proof of identity. Use the authenticated context supplied by the SDK.

## Get the authenticated user

Use `getAuth(req)` to access the authentication context in a protected route.

```ts
import express from "express";
import { getAuth, requireAuth } from "@digit-auth/node";
import { digitAuth } from "./lib/digit-auth.js";

const app = express();

app.get("/profile", requireAuth(digitAuth), (req, res) => {
  const authContext = getAuth(req);

  if (!authContext) {
    res.status(401).json({
      error: "Authentication required",
    });
    return;
  }

  res.json({
    user: authContext.user,
  });
});
```

`getAuth(req)` returns the authentication context or `null` if no context is attached. Checking for `null` keeps the code safe and compatible with TypeScript's strict null checks.

The authenticated user information can help your application determine which user's resources should be queried.

**Important:** Authentication does not automatically isolate your application's database records. Always scope database queries and updates to the authenticated user or authorized tenant.

## Role authorization

Use `requireRole()` to restrict a route to users with the required role.

```ts
import express from "express";
import { requireAuth, requireRole } from "@digit-auth/node";
import { UserRole } from "@digit-auth/core";
import { digitAuth } from "./lib/digit-auth.js";

const app = express();

app.get(
  "/admin",
  requireAuth(digitAuth),
  requireRole(UserRole.ADMIN),
  (_req, res) => {
    res.json({
      message: "Admin access granted.",
    });
  },
);
```

In this example, the request must pass authentication and the role check before the route handler runs.

Use the roles supported by your DigitAuth setup. Do not assume that a user has a role merely because the frontend displays an administrative interface.

## Permission authorization

Use `requirePermission()` to restrict access to a route based on a required permission.

```ts
import express from "express";
import { requireAuth, requirePermission } from "@digit-auth/node";
import { Permission } from "@digit-auth/core";
import { digitAuth } from "./lib/digit-auth.js";

const app = express();

app.get(
  "/users",
  requireAuth(digitAuth),
  requirePermission(Permission.USER_READ),
  (_req, res) => {
    res.json({
      message: "User read access granted.",
    });
  },
);
```

If a request does not satisfy the configured permission check, the middleware prevents the protected handler from running.

Use the permission constants exported by the version of `@digit-auth/core` compatible with your SDK. Configure and assign roles and permissions according to the authorization model supported by your DigitAuth installation.

## Ownership authorization

Authentication and role checks do not necessarily mean a user owns a particular resource.

Use ownership middleware when a route should only be accessible to the user who owns the resource.

### Compare a route parameter with the authenticated user's ID

```ts
import express from "express";
import { requireAuth, requireOwnership } from "@digit-auth/node";
import { digitAuth } from "./lib/digit-auth.js";

const app = express();

app.get(
  "/users/:userId/profile",
  requireAuth(digitAuth),
  requireOwnership({ param: "userId" }),
  (req, res) => {
    res.json({
      message: "You own this resource.",
    });
  },
);
```

This example uses the ownership middleware to compare the configured route parameter with the authenticated user's ID.

Use this pattern only when the route parameter represents the owner identity that should be compared with the authenticated user.

### Check ownership using a database lookup

For resources such as projects, documents, or invoices, ownership usually needs to be checked against the database.

The following example illustrates the pattern. Replace `findProject` with your actual database lookup:

```ts
import express from "express";
import { getAuth, requireAuth, requireOwner } from "@digit-auth/node";
import { digitAuth } from "./lib/digit-auth.js";

const app = express();

app.get(
  "/projects/:projectId",
  requireAuth(digitAuth),
  requireOwner(async (req) => {
    const project = await findProject(req.params.projectId);

    if (!project) {
      return null;
    }

    return project.ownerId;
  }),
  async (req, res) => {
    const project = await findProject(req.params.projectId);

    if (!project) {
      res.status(404).json({
        error: "Project not found",
      });
      return;
    }

    const authContext = getAuth(req);

    if (!authContext) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    res.json({ project });
  },
);
```

`findProject` is an illustrative placeholder, not a function supplied by the SDK. Replace it with your own database implementation and confirm the ownership middleware's expected return-value behavior in the installed SDK version before relying on `null` for a missing record.

For stronger data isolation, prefer querying the resource by both its ID and the authenticated owner's ID. This helps prevent users from accessing another user's records by changing a URL parameter.

For example, the underlying database query could follow this pattern:

```ts
const project = await Project.findOne({
  _id: projectId,
  ownerId: authContext.user.id,
});
```

Adjust the field names to match your own schema and the authenticated user shape returned by your DigitAuth API.

## Authorization model

A typical request flow looks like this:

1. The user signs in through DigitAuth and obtains an access token.
2. The user's application sends the token to its own backend in the `Authorization` header.
3. The Express backend runs `requireAuth()`.
4. The SDK communicates with the DigitAuth API to validate the token and retrieve the authenticated user.
5. The authentication context becomes available to subsequent middleware and route handlers.
6. Additional middleware, such as role, permission, or ownership checks, can restrict access before the handler runs.
7. The application accesses its own resources while enforcing its own database ownership and tenant-isolation rules.

The SDK is an integration layer between your Express backend and the DigitAuth API. It does not remove the need to implement application-specific business rules or data-access security.

## Error handling

The SDK exports `DigitAuthError` for handling errors returned by SDK operations.

For example, a route handler that directly calls an SDK client method can handle expected SDK errors:

```ts
import { DigitAuthError } from "@digit-auth/node";

try {
  // Call an SDK client method here.
} catch (error) {
  if (error instanceof DigitAuthError) {
    console.error({
      message: error.message,
      status: error.status,
      code: error.code,
    });
  } else {
    console.error("Unexpected error", error);
  }
}
```

The example above illustrates error handling; replace the comment with an actual SDK operation.

The SDK error may include:

- `message`: a human-readable error message
- `status`: the associated HTTP status
- `code`: an error category, such as `API_ERROR`, `NETWORK_ERROR`, or `INVALID_RESPONSE`

Handle errors according to their meaning. Avoid sending raw internal error details, credentials, access tokens, or stack traces to end users.

### Express error middleware

Authentication or authorization middleware may forward errors through Express's error-handling mechanism. Your application should have an error handler that returns appropriate HTTP responses and logs unexpected failures safely.

Example:

```ts
import type { ErrorRequestHandler } from "express";
import { DigitAuthError } from "@digit-auth/node";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof DigitAuthError) {
    res.status(error.status).json({
      error: error.message,
      code: error.code,
    });
    return;
  }

  console.error("Unexpected server error", error);

  res.status(500).json({
    error: "Internal server error",
  });
};
```

Register your error handler after your routes and other middleware:

```ts
app.use(errorHandler);
```

Confirm the exact error-forwarding behavior of each middleware in the SDK version you install. Do not assume every authentication failure follows the same error path without testing it.

## API URL configuration

The SDK's `apiUrl` should be the base URL for the DigitAuth API.

Local development example:

```ts
const auth = createDigitAuth({
  apiUrl: "http://localhost:5000/api/v1",
  clientId: process.env.DIGIT_AUTH_CLIENT_ID!,
  clientSecret: process.env.DIGIT_AUTH_CLIENT_SECRET!,
});
```

Production example:

```ts
const auth = createDigitAuth({
  apiUrl: "https://your-digit-auth-api.example.com/api/v1",
  clientId: process.env.DIGIT_AUTH_CLIENT_ID!,
  clientSecret: process.env.DIGIT_AUTH_CLIENT_SECRET!,
});
```

Replace the example production domain with your deployed API's actual address.

These snippets illustrate the required configuration fields. For production applications, validate the environment variables before initializing the client rather than relying on TypeScript non-null assertions.

Do not use the dashboard's URL in place of the API URL.

## SDK client methods

The SDK client provides methods for common authentication operations, including:

- `register`
- `login`
- `refreshToken`
- `logout`
- `logoutAll`
- `verifyEmail`
- `resendVerificationEmail`
- `forgotPassword`
- `resetPassword`
- `getCurrentUser`
- `getSessions`
- `revokeSession`
- `revokeOtherSessions`

These methods communicate with the DigitAuth API. Check the TypeScript definitions shipped with your installed package for each method's exact parameters, return type, and error behavior.

## Troubleshooting

### Missing configuration

If initialization fails because configuration is missing, verify that all three variables are set:

```env
DIGIT_AUTH_API_URL=
DIGIT_AUTH_CLIENT_ID=
DIGIT_AUTH_CLIENT_SECRET=
```

Make sure environment variables are loaded before the module that initializes the client is imported.

### API connection errors

Check that:

- The DigitAuth API is running and reachable.
- `DIGIT_AUTH_API_URL` points to the API base URL.
- The configured API path matches your deployment.
- Network access and HTTPS configuration are correct.

### Authentication failures

Check that:

- The request includes `Authorization: Bearer <access-token>`.
- The token has not expired or been revoked.
- The client credentials are valid for the configured DigitAuth application.
- The backend is connecting to the intended environment.

Never solve an authentication failure by disabling the authentication middleware in production.

### Package version problems

Check the installed version:

```bash
pnpm list @digit-auth/node
```

Check versions published to npm:

```bash
pnpm view @digit-auth/node versions
```

If you need a specific version, install it explicitly:

```bash
pnpm add @digit-auth/node@0.1.0
```

### TypeScript errors

Confirm that your application uses a compatible Node.js and TypeScript configuration, and that your Express version satisfies the SDK's peer dependency.

The SDK is an ES module package. In TypeScript applications, follow the module configuration appropriate for your runtime and build tooling.

## Receiving DigitAuth webhooks

Webhook signature verification is separate from the `@digit-auth/node` authentication middleware. Your webhook endpoint should verify the incoming request using the signing secret configured for the DigitAuth application.

DigitAuth currently emits the `user.created` event when a user is registered for an application with a configured webhook URL.

### Receiver requirements

1. Read the exact raw HTTP request body before JSON parsing changes or re-serializes it.
2. Read the `digitauth-timestamp` and `digitauth-signature` headers.
3. Recompute the HMAC-SHA256 signature over `timestamp + "." + rawBody`, using the application's webhook signing secret.
4. Compare the expected signature with the supplied signature in constant time.
5. Reject invalid signatures and timestamps outside your accepted freshness window.
6. Parse and process the JSON payload only after verification.

The signature header uses the format `sha256=<hex digest>`. The JSON event envelope contains `id`, `type`, `createdAt`, and `data`.

Return a 2xx response after accepting the event. Design handlers to be idempotent because delivery may be retried. Never place webhook signing secrets in browser code, logs, source control, or public environment variables.

**Important:** The receiver must use the raw request body for verification. `JSON.stringify()` on a parsed object is not a reliable substitute for the original bytes.

## Security considerations

- Do not expose your DigitAuth client secret to browsers or mobile clients.
- Use HTTPS in production.
- Treat access and refresh tokens as sensitive credentials.
- Keep protected routes behind authentication middleware.
- Use role and permission checks for operations that require them.
- Enforce resource ownership and tenant isolation in your database queries.
- Validate user input independently of authentication.
- Avoid logging tokens, client secrets, passwords, or other sensitive information.
- Return safe, appropriate errors to clients.
- Test authorization failures as well as successful requests.

The SDK provides integration helpers; your application remains responsible for protecting its own data and enforcing its business rules.

## License

MIT
