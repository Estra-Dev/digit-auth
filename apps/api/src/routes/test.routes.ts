import { Router } from "express";

import { requireAuth } from "../middlewares/require-auth.middleware.js";
import { requireRole } from "../middlewares/require-role.middleware.js";
import { UserRole } from "../authorization/roles.js";
import { Permission } from "../authorization/permissions.js";
import { requirePermission } from "../authorization/require-permission.middleware.js";
import { requireOwner } from "../authorization/ownership/require-owner.middleware.js";

// import { UserRole } from "../modules/auth/model/user.model.js";

const router = Router();

router.get("/admin", requireAuth, requireRole(UserRole.ADMIN), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin Access Granted",
  });
});

router.get(
  "/permission/profile",
  requireAuth,
  requirePermission(Permission.PROFILE_READ),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Profile Permission Granted",
    });
  },
);

router.get(
  "/permission/users",
  requireAuth,
  requirePermission(Permission.USER_READ),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "User Permission Granted",
    });
  },
);

router.get(
  "/owner/:id",
  requireAuth,
  requireOwner((req) => req.params.id as string),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Owner Access Granted",
    });
  },
);

export default router;
