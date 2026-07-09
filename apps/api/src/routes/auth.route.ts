import { Router } from "express";
import {
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validators/login.schema.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/refresh", refreshToken);
authRouter.post("/logout", logout);
authRouter.post("/logout-all", logoutAll);

export default authRouter;
