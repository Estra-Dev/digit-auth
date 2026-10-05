import { Router } from "express";

import { requirePlatformAuth } from "../middlewares/require-platform-auth.middleware.js";
import { getCurrentWorkspace } from "../controllers/workspace.controller.js";

const router = Router();

router.use(requirePlatformAuth);

router.get("/me", getCurrentWorkspace);

export default router;
