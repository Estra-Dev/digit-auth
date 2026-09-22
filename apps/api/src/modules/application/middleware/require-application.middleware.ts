import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../../core/errors/AppError.js";
import { applicationService } from "../service/application.service.js";

export async function requireApplication(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const clientId = req.header("X-DigitAuth-Client-Id");

  if (!clientId) {
    throw new AppError(
      "DigitAuth application client ID is required.",
      401,
      true,
    );
  }

  const application = await applicationService.getActiveApplication(clientId);

  req.application = application;

  next();
}
