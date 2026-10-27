import pino from "pino";
import { config } from "./index.js";

const redactPaths = [
  "password",
  "currentPassword",
  "newPassword",
  "confirmPassword",
  "passwordHash",
  "passwordHashed",
  "clientSecret",
  "clientSecretHash",
  "clientSecretHashed",
  "accessToken",
  "refreshToken",
  "token",
  "verificationToken",
  "resetToken",
  "authorization",
  "cookie",
  "req.headers.authorization",
  "req.headers.cookie",
  "headers.authorization",
  "headers.cookie",
  "*.password",
  "*.clientSecret",
  "*.accessToken",
  "*.refreshToken",
];

const loggerOptions = {
  level: "info",
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
  },
  ...(config.env === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
};

export const logger = pino(loggerOptions);
