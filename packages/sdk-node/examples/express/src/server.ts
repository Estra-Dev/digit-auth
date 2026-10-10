import "dotenv/config";

import express from "express";
import type { NextFunction, Request, Response } from "express";

import {
  createDigitAuth,
  DigitAuthError,
  Permission,
  requireAuth,
  requireOwner,
  requireOwnership,
  requirePermission,
  requireRole,
  UserRole,
} from "@digit-auth/node";

const apiUrl = process.env.DIGIT_AUTH_API_URL;
const clientId = process.env.DIGIT_AUTH_CLIENT_ID;
const clientSecret = process.env.DIGIT_AUTH_CLIENT_SECRET;

if (!apiUrl) {
  throw new Error("DIGIT_AUTH_API_URL is required.");
}

if (!clientId) {
  throw new Error("DIGIT_AUTH_CLIENT_ID is required.");
}

if (!clientSecret) {
  throw new Error("DIGIT_AUTH_CLIENT_SECRET is required.");
}

const port = Number(process.env.PORT ?? "3000");

const digitAuth = createDigitAuth({
  apiUrl,
  clientId,
  clientSecret,
});

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "DigitAuth Express example",
    routes: [
      "GET /me",
      "GET /profile",
      "GET /admin",
      "GET /users/:userId",
      "GET /owned-resource/:ownerId",
    ],
  });
});

// Any authenticated user.
app.get("/me", requireAuth(digitAuth), (req, res) => {
  res.json({
    user: req.auth?.user,
  });
});

// Requires PROFILE_READ.
app.get(
  "/profile",
  requireAuth(digitAuth),
  requirePermission(Permission.PROFILE_READ),
  (req, res) => {
    res.json({
      message: "Profile permission granted.",
      user: req.auth?.user,
    });
  },
);

// Requires the ADMIN role.
app.get(
  "/admin",
  requireAuth(digitAuth),
  requireRole(UserRole.ADMIN),
  (req, res) => {
    res.json({
      message: "Admin access granted.",
      user: req.auth?.user,
    });
  },
);

// The authenticated user can access their own user resource.
// ADMIN bypass is enabled by default.
app.get(
  "/users/:userId",
  requireAuth(digitAuth),
  requireOwnership(),
  (req, res) => {
    res.json({
      message: "Ownership check passed.",
      requestedUserId: req.params.userId,
      authenticatedUser: req.auth?.user,
    });
  },
);

// Demonstrates ownership resolved from a route parameter.
app.get(
  "/owned-resource/:ownerId",
  requireAuth(digitAuth),
  requireOwner((req) => {
    const ownerId = req.params.ownerId;

    return typeof ownerId === "string" ? ownerId : undefined;
  }),
  (req, res) => {
    res.json({
      message: "Resource owner check passed.",
      ownerId: req.params.ownerId,
      authenticatedUser: req.auth?.user,
    });
  },
);

// Keep SDK errors in a predictable JSON format.
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof DigitAuthError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      code: error.code,
    });
    return;
  }

  console.error("Unexpected Express error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

app.listen(port, () => {
  console.log(`DigitAuth Express example running on http://localhost:${port}`);
});
