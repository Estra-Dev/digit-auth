import { rateLimit } from "express-rate-limit";
import { config } from "../../config/index.js";

export function createRateLimit(
  windowMs: number,
  max: number,
  message: string,
) {
  return rateLimit({
    windowMs,
    max,

    standardHeaders: true,
    legacyHeaders: false,

    skip: () => config.isTest,

    message: {
      success: false,
      message,
    },
  });
}
