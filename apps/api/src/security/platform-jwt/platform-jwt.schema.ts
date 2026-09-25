import { Types } from "mongoose";
import { z } from "zod";

export const platformJwtPayloadSchema = z.object({
  sub: z
    .string()
    .refine((id) => Types.ObjectId.isValid(id), "Invalid ObjectId"),

  email: z.email(),

  sessionId: z
    .string()
    .refine((id) => Types.ObjectId.isValid(id), "Invalid platform session ID"),

  tokenType: z.literal("platform"),
});

export type PlatformJwtPayload = z.infer<typeof platformJwtPayloadSchema>;
