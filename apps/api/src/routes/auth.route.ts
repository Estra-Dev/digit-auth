import { Router } from "express";
import {
  forgotPassword,
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

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/refresh", refreshToken);
authRouter.post("/logout", logout);
authRouter.post("/logout-all", logoutAll);
authRouter.post("/verify-email", verifyEmail);
authRouter.post(
  "/resend-verification-email",
  validate(resendVerificationSchema),
  resendVerificationEmail,
);
authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword,
);
authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword,
);

export default authRouter;
