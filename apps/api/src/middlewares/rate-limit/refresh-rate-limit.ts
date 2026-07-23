import { config } from "../../config/index.js";
import { createRateLimit } from "./create-rate-limit.js";

export const refreshTokenLimiter = createRateLimit(
  60 * 1000,
  config.RATE_LIMIT_REFRESH_MAX,
  "Too many refresh requests.",
);
