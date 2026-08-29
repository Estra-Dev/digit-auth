import { Router } from "express";

import adminRouter from "../admin.routes.js";
import adminSessionRouter from "./admin-session.routes.js";
import adminSecurityEventRouter from "./admin-security-event.routes.js";
import adminAuditRouter from "./admin-audit.routes.js";

const router = Router();

router.use(adminRouter);
router.use(adminSessionRouter);
router.use(adminSecurityEventRouter);
router.use(adminAuditRouter);

export default router;
