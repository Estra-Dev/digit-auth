import { type ZodType } from "zod";
import {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
} from "express";
import { ApiResponse } from "../core/response/ApiResponse.js";

// export function validate<T>(schema: ZodType<T>): RequestHandler {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const result = schema.safeParse({
//       body: req.body,
//       params: req.params,
//       query: req.query,
//     });

//     if (!result.success) {
//       return ApiResponse.error(res, {
//         statusCode: 400,
//         message: "Validation Failed",
//         errors: result.error.flatten(),
//       });
//     }

//     req.body = (result.data as { body: unknown }).body;

//     return next();
//   };
// }

export function validate<T>(schema: ZodType<T>): RequestHandler {
  return (req, res, next) => {
    console.log("==============");
    console.log(req.originalUrl);
    console.log("BODY RECEIVED:");
    console.dir(req.body, { depth: null });

    const payload = {
      body: req.body,
      params: req.params,
      query: req.query,
    };

    console.log("PAYLOAD TO ZOD:");
    console.dir(payload, { depth: null });

    const result = schema.safeParse(payload);

    console.log("RESULT");
    console.dir(result, { depth: null });

    if (!result.success) {
      console.log("VALIDATION ERROR:");
      console.dir(result.error.flatten(), { depth: null });

      return ApiResponse.error(res, {
        statusCode: 400,
        message: "Validation Failed",
        errors: result.error.flatten(),
      });
    }

    console.log("PARSED:");
    console.dir(result.data, { depth: null });

    req.body = (result.data as { body: unknown }).body;

    next();
  };
}
