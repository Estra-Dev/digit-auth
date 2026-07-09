import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "first name must be at least 2 characters long")
      .max(50),

    lastName: z
      .string()
      .trim()
      .min(2, "last name must be at least 2 characters long")
      .max(50),

    email: z.email("Please Provide a valid email").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
