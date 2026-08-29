import { Router } from "express";

import { requireAuth } from "../../middlewares/require-auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import { Permission } from "../../authorization/permissions.js";
import { requirePermission } from "../../authorization/require-permission.middleware.js";

import {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} from "./controller/admin-user.controller.js";

import {
  adminUserIdSchema,
  updateUserByAdminSchema,
} from "./validators/admin-user.schema.js";

const adminRouter = Router();

adminRouter.get(
  "/users",
  requireAuth,
  requirePermission(Permission.USER_READ),
  listUsers,
);

adminRouter.get(
  "/users/:id",
  requireAuth,
  requirePermission(Permission.USER_READ),
  validate(adminUserIdSchema),
  getUser,
);

adminRouter.patch(
  "/users/:id",
  requireAuth,
  requirePermission(Permission.USER_UPDATE),
  validate(updateUserByAdminSchema),
  updateUser,
);

adminRouter.delete(
  "/users/:id",
  requireAuth,
  requirePermission(Permission.USER_DELETE),
  validate(adminUserIdSchema),
  deleteUser,
);

export default adminRouter;
