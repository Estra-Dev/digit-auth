import { ZodError, ZodType } from "zod";
import { AppError } from "../errors/AppError.js";

export function parseRequest<T>(schema: ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError("Validation Failed", 400, true);
    }

    throw error;
  }
}

// export function parseRequest<T>(schema: ZodType<T>, data: unknown): T {
//   console.log("parseRequest received:");
//   console.dir(data, { depth: null });

//   return schema.parse(data);
// }
