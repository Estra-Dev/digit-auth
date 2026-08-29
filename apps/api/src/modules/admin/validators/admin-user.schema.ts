import { z } from "zod";

import { UserRole } from "../../../authorization/roles.js";
import { UserStatus } from "../../auth/model/user.model.js";

export const adminUserIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateUserByAdminSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),

  body: z
    .object({
      firstName: z.string().trim().min(2).max(50).optional(),

      lastName: z.string().trim().min(2).max(50).optional(),

      role: z.enum(UserRole).optional(),

      status: z.enum(UserStatus).optional(),
    })
    .refine(
      (data) =>
        data.firstName !== undefined ||
        data.lastName !== undefined ||
        data.role !== undefined ||
        data.status !== undefined,
      {
        message: "At least one field must be provided",
      },
    ),
});

export type UpdateUserByAdminInput = z.infer<typeof updateUserByAdminSchema>;
