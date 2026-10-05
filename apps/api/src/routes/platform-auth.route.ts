import { Router } from "express";

import {
  platformRegister,
  resendPlatformVerificationEmail,
  platformLogin,
  platformRefreshToken,
  platformLogout,
  platformLogoutAll,
  getPlatformAccount,
  getPlatformSessions,
  revokePlatformSession,
  revokeOtherPlatformSessions,
  forgotPlatformPassword,
  resetPlatformPassword,
  changePlatformPassword,
} from "../controllers/platform-auth.controller.js";

import { requirePlatformAuth } from "../middlewares/require-platform-auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  platformRegisterSchema,
  platformLoginSchema,
  platformRefreshTokenSchema,
  platformLogoutSchema,
  platformResendVerificationEmailSchema,
  platformForgotPasswordSchema,
  platformResetPasswordSchema,
  platformChangePasswordSchema,
} from "../validators/platform-auth.validator.js";

import { loginRateLimit } from "../middlewares/rate-limit/login-rate-limit.js";
import { refreshTokenLimiter } from "../middlewares/rate-limit/refresh-rate-limit.js";
import { verifyPlatformEmail } from "../controllers/platform-email-verification.controller.js";

const platformAuthRouter = Router();

/*
 * Public platform authentication routes
 */

platformAuthRouter.post(
  "/register",
  loginRateLimit,
  validate(platformRegisterSchema),
  platformRegister,
);

platformAuthRouter.post(
  "/resend-verification-email",
  loginRateLimit,
  validate(platformResendVerificationEmailSchema),
  resendPlatformVerificationEmail,
);

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
platformAuthRouter.post("/verify-email", verifyPlatformEmail);
platformAuthRouter.post(
  "/forgot-password",
  loginRateLimit,
  validate(platformForgotPasswordSchema),
  forgotPlatformPassword,
);

platformAuthRouter.post(
  "/reset-password",
  loginRateLimit,
  validate(platformResetPasswordSchema),
  resetPlatformPassword,
);

platformAuthRouter.patch(
  "/password",
  requirePlatformAuth,
  validate(platformChangePasswordSchema),
  changePlatformPassword,
);

export default platformAuthRouter;
