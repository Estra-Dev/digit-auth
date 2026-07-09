import { type Request, type Response } from "express";
import { ApiResponse } from "../core/response/ApiResponse.js";

export const notFoundMiddleware = (req: Request, res: Response) => {
  return ApiResponse.error(res, {
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
  });
};
