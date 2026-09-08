import { config } from "../../config/index.js";

import { createRateLimit } from "./create-rate-limit.js";

export const passwordResetRateLimit = createRateLimit(
  config.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  config.RATE_LIMIT_AUTH_MAX,
  "Too many password reset attempts. Please try again later.",
);
