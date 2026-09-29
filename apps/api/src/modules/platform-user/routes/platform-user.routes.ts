import { Router } from "express";

import { requirePlatformAuth } from "../../../middlewares/require-platform-auth.middleware.js";

import {
  getPlatformUser,
  listPlatformUsers,
} from "../controller/platform-user.controller.js";

const router = Router();

router.use(requirePlatformAuth);

router.get("/", listPlatformUsers);
router.get("/:id", getPlatformUser);

export default router;
