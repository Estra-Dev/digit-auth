import { z } from "zod";

const platformLoginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const platformRefreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1),
});

const platformLogoutBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const platformLoginSchema = z.object({
  body: platformLoginBodySchema,
  params: z.object({}),
  query: z.object({}),
});

export const platformRefreshTokenSchema = z.object({
  body: platformRefreshTokenBodySchema,
  params: z.object({}),
  query: z.object({}),
});

export const platformLogoutSchema = z.object({
  body: platformLogoutBodySchema,
  params: z.object({}),
  query: z.object({}),
});

// These represent req.body AFTER validate() unwraps the body.
export type PlatformLoginInput = z.infer<typeof platformLoginBodySchema>;

export type PlatformRefreshTokenInput = z.infer<
  typeof platformRefreshTokenBodySchema
>;

export type PlatformLogoutInput = z.infer<typeof platformLogoutBodySchema>;
