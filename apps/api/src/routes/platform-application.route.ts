import { Router } from "express";

import {
  activatePlatformApplication,
  createPlatformApplication,
  getPlatformApplication,
  listPlatformApplications,
  rotatePlatformApplicationSecret,
  suspendPlatformApplication,
} from "../controllers/platform-application.controller.js";

import { requirePlatformAuth } from "../middlewares/require-platform-auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createPlatformApplicationSchema,
  platformApplicationIdSchema,
} from "../validators/platform-application.validator.js";

const router = Router();

router.use(requirePlatformAuth);

router.post(
  "/",
  validate(createPlatformApplicationSchema),
  createPlatformApplication,
);

router.get("/", listPlatformApplications);

router.get(
  "/:id",
  validate(platformApplicationIdSchema),
  getPlatformApplication,
);

router.patch(
  "/:id/suspend",
  validate(platformApplicationIdSchema),
  suspendPlatformApplication,
);

router.patch(
  "/:id/activate",
  validate(platformApplicationIdSchema),
  activatePlatformApplication,
);

router.post(
  "/:id/rotate-secret",
  validate(platformApplicationIdSchema),
  rotatePlatformApplicationSecret,
);

export default router;
