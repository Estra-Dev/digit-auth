import { Router } from "express";

import {
  forgotPassword,
  getCurrentUser,
  getMySessions,
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
  resendVerificationEmail,
  resetPassword,
  revokeOtherSessions,
  revokeSession,
  verifyEmail,
} from "../controllers/auth.controller.js";

import { requirePublishableApplication } from "../modules/application/index.js";

import { requireAuth } from "../middlewares/require-auth.middleware.js";
import { requireActiveUser } from "../middlewares/require-active-user.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import { loginSchema } from "../validators/login.schema.js";
import { resendVerificationSchema } from "../validators/resend-verification.schema.js";
import { forgotPasswordSchema } from "../validators/forgot-password.schema.js";
import { resetPasswordSchema } from "../validators/reset-password.schema.js";
import { refreshTokenSchema } from "../validators/refresh-token.schema.js";
import { logoutSchema } from "../validators/logout.schema.js";

import { authRateLimit } from "../middlewares/rate-limit/auth-rate-limit.js";
import { loginRateLimit } from "../middlewares/rate-limit/login-rate-limit.js";
import { registerRateLimit } from "../middlewares/rate-limit/register-rate-limit.js";
import { passwordResetRateLimit } from "../middlewares/rate-limit/password-reset-rate-limit.js";
import { refreshTokenLimiter } from "../middlewares/rate-limit/refresh-rate-limit.js";
import { resendVerificationRateLimit } from "../middlewares/rate-limit/resend-verification-rate-limit.js";
import { apiRateLimit } from "../middlewares/rate-limit/api-rate-limit.js";

const authRouter = Router();

/*
 * Public application-scoped authentication routes
 */

authRouter.post(
  "/register",
  requirePublishableApplication,
  registerRateLimit,
  register,
);

authRouter.post(
  "/login",
  requirePublishableApplication,
  loginRateLimit,
  validate(loginSchema),
  login,
);

authRouter.post(
  "/refresh",
  requirePublishableApplication,
  refreshTokenLimiter,
  validate(refreshTokenSchema),
  refreshToken,
);

authRouter.post(
  "/logout",
  requirePublishableApplication,
  validate(logoutSchema),
  logout,
);

authRouter.post(
  "/logout-all",
  requirePublishableApplication,
  validate(logoutSchema),
  logoutAll,
);

authRouter.post("/verify-email", requirePublishableApplication, verifyEmail);

authRouter.post(
  "/resend-verification-email",
  requirePublishableApplication,
  resendVerificationRateLimit,
  validate(resendVerificationSchema),
  resendVerificationEmail,
);

authRouter.post(
  "/forgot-password",
  requirePublishableApplication,
  passwordResetRateLimit,
  validate(forgotPasswordSchema),
  forgotPassword,
);

authRouter.post(
  "/reset-password",
  requirePublishableApplication,
  validate(resetPasswordSchema),
  resetPassword,
);

/*
 * Protected application-scoped authentication routes
 */

authRouter.get(
  "/me",
  requirePublishableApplication,
  requireAuth,
  requireActiveUser,
  getCurrentUser,
);

authRouter.get(
  "/sessions",
  requirePublishableApplication,
  requireAuth,
  getMySessions,
);

authRouter.delete(
  "/sessions/:id",
  requirePublishableApplication,
  requireAuth,
  revokeSession,
);

authRouter.delete(
  "/sessions",
  requirePublishableApplication,
  requireAuth,
  validate(logoutSchema),
  revokeOtherSessions,
);

export default authRouter;
