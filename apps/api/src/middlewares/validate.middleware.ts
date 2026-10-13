import { type ZodType } from "zod";
import type { RequestHandler } from "express";
import { ApiResponse } from "../core/response/ApiResponse.js";

export function validate<T>(schema: ZodType<T>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      ApiResponse.error(res, {
        statusCode: 400,
        message: "Validation Failed",
        errors: result.error.flatten(),
      });

      return;
    }

    req.body = (result.data as { body: unknown }).body;

    next();
  };
}
