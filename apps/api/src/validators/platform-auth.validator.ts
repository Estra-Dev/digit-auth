import { z } from "zod";

const platformRegisterBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

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

const platformResendVerificationEmailBodySchema = z.object({
  email: z.email(),
});

const platformForgotPasswordBodySchema = z.object({
  email: z.email(),
});

const platformResetPasswordBodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const platformRegisterSchema = z.object({
  body: platformRegisterBodySchema,
  params: z.object({}),
  query: z.object({}),
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

export const platformResendVerificationEmailSchema = z.object({
  body: platformResendVerificationEmailBodySchema,
  params: z.object({}),
  query: z.object({}),
});

export const platformForgotPasswordSchema = z.object({
  body: platformForgotPasswordBodySchema,
  params: z.object({}),
  query: z.object({}),
});

export const platformResetPasswordSchema = z.object({
  body: platformResetPasswordBodySchema,
  params: z.object({}),
  query: z.object({}),
});

const platformChangePasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const platformChangePasswordSchema = z.object({
  body: platformChangePasswordBodySchema,
  params: z.object({}),
  query: z.object({}),
});

// These represent req.body AFTER validate() unwraps the body.
export type PlatformRegisterInput = z.infer<typeof platformRegisterBodySchema>;

export type PlatformLoginInput = z.infer<typeof platformLoginBodySchema>;

export type PlatformRefreshTokenInput = z.infer<
  typeof platformRefreshTokenBodySchema
>;

export type PlatformLogoutInput = z.infer<typeof platformLogoutBodySchema>;

export type PlatformResendVerificationEmailInput = z.infer<
  typeof platformResendVerificationEmailBodySchema
>;

export type PlatformForgotPasswordInput = z.infer<
  typeof platformForgotPasswordBodySchema
>;

export type PlatformResetPasswordInput = z.infer<
  typeof platformResetPasswordBodySchema
>;

export type PlatformChangePasswordInput = z.infer<
  typeof platformChangePasswordBodySchema
>;
