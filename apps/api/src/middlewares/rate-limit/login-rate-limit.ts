import { config } from "../../config/index.js";

import { createRateLimit } from "./create-rate-limit.js";

export const loginRateLimit = createRateLimit(
  config.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  config.RATE_LIMIT_AUTH_MAX,
  "Too many login attempts. Please try again later.",
);
