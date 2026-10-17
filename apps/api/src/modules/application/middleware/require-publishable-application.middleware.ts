import type { RequestHandler } from "express";

import { AppError } from "../../../core/errors/AppError.js";
import { applicationService } from "../service/application.service.js";

export const requirePublishableApplication: RequestHandler = async (
  req,
  _res,
  next,
) => {
  try {
    const publishableKey = req.header("X-DigitAuth-Publishable-Key");

    if (!publishableKey) {
      throw new AppError("DigitAuth publishable key is required.", 401, true);
    }

    const application =
      await applicationService.getActiveApplicationByPublishableKey(
        publishableKey,
      );

    const origin = req.get("Origin");

    // Requests without Origin are typically server-to-server or non-browser
    // requests. CORS is not a substitute for authentication.
    if (origin && !(application.allowedOrigins ?? []).includes(origin)) {
      throw new AppError(
        "This origin is not allowed for this application.",
        403,
        true,
      );
    }

    req.application = application;
    next();
  } catch (error) {
    next(error);
  }
};
