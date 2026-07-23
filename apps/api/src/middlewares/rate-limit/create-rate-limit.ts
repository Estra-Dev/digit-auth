import { rateLimit } from "express-rate-limit";

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
    message: {
      success: false,
      message,
    },
  });
}
