import { Router } from "express";

import { requireAuth } from "../../middlewares/require-auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  updateProfile,
  changePassword,
  deleteAccount,
} from "./controller/profile.controller.js";

import { updateProfileSchema } from "./validators/update-profile.schema.js";
import { changePasswordSchema } from "./validators/change-password.schema.js";

const profileRouter = Router();

profileRouter.patch(
  "/",
  requireAuth,
  validate(updateProfileSchema),
  updateProfile,
);

profileRouter.patch(
  "/password",
  requireAuth,
  validate(changePasswordSchema),
  changePassword,
);

profileRouter.delete("/", requireAuth, deleteAccount);

export default profileRouter;
