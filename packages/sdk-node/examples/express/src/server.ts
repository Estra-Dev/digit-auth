import "dotenv/config";

import express from "express";

import { createDigitAuth, requireAuth } from "@digit-auth/node";

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
  });
});

app.get("/me", requireAuth(digitAuth), (req, res) => {
  res.json({
    user: req.auth?.user,
  });
});

app.listen(port, () => {
  console.log(`DigitAuth Express example running on http://localhost:${port}`);
});
