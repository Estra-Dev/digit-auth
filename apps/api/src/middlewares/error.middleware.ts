import { type Request, type NextFunction, type Response } from "express";
import { AppError } from "../core/errors/AppError.js";
import { ApiResponse } from "../core/response/ApiResponse.js";

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

  console.log(err);

  return ApiResponse.error(res, {
    statusCode: 500,
    message: "Internal Server Error",
  });
};
