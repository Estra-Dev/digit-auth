import { type Request, type NextFunction, type Response } from "express";
import { AppError } from "../core/errors/AppError.js";
import { ApiResponse } from "../core/response/ApiResponse.js";
import { config } from "../config/index.js";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return ApiResponse.error(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  if (!config.isProduction) {
    console.error(err);
  } else {
    console.error("Unhandled application error");
  }

  return ApiResponse.error(res, {
    statusCode: 500,
    message: "Internal Server Error",
  });
};
