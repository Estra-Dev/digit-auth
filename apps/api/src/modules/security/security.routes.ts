import { Router } from "express";

import { requireAuth } from "../../middlewares/require-auth.middleware.js";

import { getSecurityEvents } from "./controller/security.controller.js";
import { apiRateLimit } from "../../middlewares/rate-limit/api-rate-limit.js";

const securityRouter = Router();

securityRouter.get("/events", apiRateLimit, requireAuth, getSecurityEvents);

export default securityRouter;
