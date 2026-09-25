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
  body: z.object({}),
  params: applicationIdParamsSchema,
  query: z.object({}),
});

export type CreatePlatformApplicationInput = z.infer<
  typeof createApplicationBodySchema
>;

export type PlatformApplicationIdInput = z.infer<
  typeof applicationIdParamsSchema
>;
