import { type ZodType } from "zod";
import {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
} from "express";
import { ApiResponse } from "../core/response/ApiResponse.js";

export function validate<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: "Validation Failed",
        errors: result.error.flatten(),
      });
    }

    req.body = (result.data as { body: unknown }).body;

    return next();
  };
}
