import { Router } from "express";

import {
  platformLogin,
  platformRefreshToken,
  platformLogout,
  platformLogoutAll,
  getPlatformAccount,
  getPlatformSessions,
  revokePlatformSession,
  revokeOtherPlatformSessions,
} from "../controllers/platform-auth.controller.js";

import { requirePlatformAuth } from "../middlewares/require-platform-auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  platformLoginSchema,
  platformRefreshTokenSchema,
  platformLogoutSchema,
} from "../validators/platform-auth.validator.js";

import { loginRateLimit } from "../middlewares/rate-limit/login-rate-limit.js";
import { refreshTokenLimiter } from "../middlewares/rate-limit/refresh-rate-limit.js";

const platformAuthRouter = Router();

/*
 * Public platform authentication routes
 */

platformAuthRouter.post(
  "/login",
  loginRateLimit,
  validate(platformLoginSchema),
  platformLogin,
);

platformAuthRouter.post(
  "/refresh",
  refreshTokenLimiter,
  validate(platformRefreshTokenSchema),
  platformRefreshToken,
);

platformAuthRouter.post(
  "/logout",
  validate(platformLogoutSchema),
  platformLogout,
);

/*
 * Protected platform authentication routes
 */

platformAuthRouter.post(
  "/logout-all",
  requirePlatformAuth,
  validate(platformLogoutSchema),
  platformLogoutAll,
);

platformAuthRouter.get("/me", requirePlatformAuth, getPlatformAccount);

platformAuthRouter.get("/sessions", requirePlatformAuth, getPlatformSessions);

platformAuthRouter.delete(
  "/sessions/:id",
  requirePlatformAuth,
  revokePlatformSession,
);

platformAuthRouter.delete(
  "/sessions",
  requirePlatformAuth,
  revokeOtherPlatformSessions,
);

export default platformAuthRouter;
