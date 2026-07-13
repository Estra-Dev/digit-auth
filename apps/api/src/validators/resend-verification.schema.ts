import { z } from "zod";

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export type ResendVerification = z.infer<
  typeof resendVerificationSchema
>["body"];
