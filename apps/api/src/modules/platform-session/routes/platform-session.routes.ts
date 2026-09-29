import { Router } from "express";

import { requirePlatformAuth } from "../../../middlewares/require-platform-auth.middleware.js";

import { listPlatformSessions } from "../controller/platform-session.controller.js";

const router = Router();

router.use(requirePlatformAuth);

router.get("/", listPlatformSessions);

export default router;
