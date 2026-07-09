import { z } from "zod";
import { Types } from "mongoose";

export const jwtPayloadSchema = z.object({
  sub: z
    .string()
    .refine((id) => Types.ObjectId.isValid(id), "Invalid ObjectId"),
  email: z.email(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
