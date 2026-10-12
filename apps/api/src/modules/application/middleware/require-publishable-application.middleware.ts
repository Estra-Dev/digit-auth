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

    req.application =
      await applicationService.getActiveApplicationByPublishableKey(
        publishableKey,
      );

    next();
  } catch (error) {
    next(error);
  }
};
