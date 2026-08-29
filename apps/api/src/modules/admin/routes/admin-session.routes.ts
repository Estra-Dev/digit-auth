import { Router } from "express";

import { requireAuth } from "../../../middlewares/require-auth.middleware.js";
import { requireRole } from "../../../middlewares/require-role.middleware.js";
import { requirePermission } from "../../../authorization/require-permission.middleware.js";

import { UserRole } from "../../../authorization/roles.js";
import { Permission } from "../../../authorization/permissions.js";

import {
  getUserSessions,
  revokeAllUserSessions,
  revokeUserSession,
} from "../controller/admin-session.controller.js";

const router = Router();

router.use(requireAuth, requireRole(UserRole.ADMIN));

router.get(
  "/users/:userId/sessions",
  requirePermission(Permission.SESSION_READ),
  getUserSessions,
);

router.delete(
  "/users/:userId/sessions/:sessionId",
  requirePermission(Permission.SESSION_DELETE),
  revokeUserSession,
);

router.delete(
  "/users/:userId/sessions",
  requirePermission(Permission.SESSION_DELETE),
  revokeAllUserSessions,
);

export default router;
