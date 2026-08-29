import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      firstName: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must not exceed 50 characters")
        .optional(),

      lastName: z
        .string()
        .trim()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must not exceed 50 characters")
        .optional(),
    })
    .refine(
      (data) => data.firstName !== undefined || data.lastName !== undefined,
      {
        message: "At least one profile field is required",
      },
    ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
