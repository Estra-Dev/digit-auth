import { z } from "zod";

const applicationIdParamsSchema = z.object({
  id: z.string().min(1),
});

const createApplicationBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const createPlatformApplicationSchema = z.object({
  body: createApplicationBodySchema,
  params: z.object({}),
  query: z.object({}),
});

export const platformApplicationIdSchema = z.object({
  body: z.object({}).default({}),
  params: applicationIdParamsSchema,
  query: z.object({}),
});

export type CreatePlatformApplicationInput = z.infer<
  typeof createApplicationBodySchema
>;

export type PlatformApplicationIdInput = z.infer<
  typeof applicationIdParamsSchema
>;

const updateApplicationOriginsBodySchema = z.object({
  allowedOrigins: z
    .array(
      z
        .string()
        .url()
        .refine((value) => {
          try {
            const url = new URL(value);

            return (
              url.origin === value &&
              (url.protocol === "http:" || url.protocol === "https:")
            );
          } catch {
            return false;
          }
        }, "Each origin must be a valid origin without a path, query, or fragment."),
    )
    .max(50),
});

export const updatePlatformApplicationOriginsSchema = z.object({
  body: updateApplicationOriginsBodySchema,
  params: applicationIdParamsSchema,
  query: z.object({}),
});

export type UpdatePlatformApplicationOriginsInput = z.infer<
  typeof updateApplicationOriginsBodySchema
>;
