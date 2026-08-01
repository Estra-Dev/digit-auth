import { Router } from "express";
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validators/login.schema.js";
import { resendVerificationSchema } from "../validators/resend-verification.schema.js";
import { forgotPasswordSchema } from "../validators/forgot-password.schema.js";
import { resetPasswordSchema } from "../validators/reset-password.schema.js";
import { refreshTokenSchema } from "../validators/refresh-token.schema.js";
import { requireAuth } from "../middlewares/require-auth.middleware.js";
import { authRateLimit } from "../middlewares/rate-limit/auth-rate-limit.js";
import { refreshTokenLimiter } from "../middlewares/rate-limit/refresh-rate-limit.js";
import { apiRateLimit } from "../middlewares/rate-limit/api-rate-limit.js";
import { logoutSchema } from "../validators/logout.schema.js";

const authRouter = Router();

authRouter.post("/register", authRateLimit, register);
authRouter.post("/login", authRateLimit, validate(loginSchema), login);
authRouter.post(
  "/refresh",
  refreshTokenLimiter,
  validate(refreshTokenSchema),
  refreshToken,
);
authRouter.post("/logout", validate(logoutSchema), logout);
authRouter.post("/logout-all", validate(logoutSchema), logoutAll);
authRouter.post("/verify-email", verifyEmail);
authRouter.post(
  "/resend-verification-email",
  authRateLimit,
  validate(resendVerificationSchema),
  resendVerificationEmail,
);
authRouter.post(
  "/forgot-password",
  authRateLimit,
  validate(forgotPasswordSchema),
  forgotPassword,
);
authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword,
);
authRouter.get("/me", apiRateLimit, requireAuth, getCurrentUser);

export default authRouter;
