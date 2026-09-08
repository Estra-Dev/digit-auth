import { config } from "../../config/index.js";

import { createRateLimit } from "./create-rate-limit.js";

export const resendVerificationRateLimit = createRateLimit(
  config.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  config.RATE_LIMIT_AUTH_MAX,
  "Too many verification email requests. Please try again later.",
);
