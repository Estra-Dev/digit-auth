import { config } from "../../config/index.js";
import { createRateLimit } from "./create-rate-limit.js";

export const apiRateLimit = createRateLimit(
  60 * 1000,
  config.RATE_LIMIT_API_MAX,
  "Too many requests.",
);
