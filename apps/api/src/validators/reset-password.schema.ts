import { z } from "zod";

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(1),
      password: z.string().min(1).max(100),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Password do not match",
    }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
