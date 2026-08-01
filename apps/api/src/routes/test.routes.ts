import { Router } from "express";

import { requireAuth } from "../middlewares/require-auth.middleware.js";
import { requireRole } from "../middlewares/require-role.middleware.js";

import { UserRole } from "../modules/auth/model/user.model.js";

const router = Router();

router.get("/admin", requireAuth, requireRole(UserRole.ADMIN), (req, res) => {
  res.json({
    success: true,
  });
});

export default router;
