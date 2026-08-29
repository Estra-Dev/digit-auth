import { Router } from "express";

import { requireAuth } from "../../../middlewares/require-auth.middleware.js";
import { requireRole } from "../../../middlewares/require-role.middleware.js";
import { requirePermission } from "../../../authorization/require-permission.middleware.js";

import { UserRole } from "../../../authorization/roles.js";
import { Permission } from "../../../authorization/permissions.js";

import { listAuditLogs } from "../controller/admin-audit.controller.js";

const router = Router();

router.use(requireAuth, requireRole(UserRole.ADMIN));

router.get(
  "/audit-logs",
  requirePermission(Permission.AUDIT_LOG_READ),
  listAuditLogs,
);

export default router;
