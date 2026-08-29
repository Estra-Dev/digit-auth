import { Router } from "express";

import { requireAuth } from "../../../middlewares/require-auth.middleware.js";
import { requireRole } from "../../../middlewares/require-role.middleware.js";
import { requirePermission } from "../../../authorization/require-permission.middleware.js";

import { UserRole } from "../../../authorization/roles.js";
import { Permission } from "../../../authorization/permissions.js";

import {
  listSecurityEvents,
  getUserSecurityEvents,
} from "../controller/admin-security-event.controller.js";

const router = Router();

router.use(requireAuth, requireRole(UserRole.ADMIN));

router.get(
  "/security-events",
  requirePermission(Permission.SECURITY_EVENT_READ),
  listSecurityEvents,
);

router.get(
  "/users/:userId/security-events",
  requirePermission(Permission.SECURITY_EVENT_READ),
  getUserSecurityEvents,
);

export default router;
