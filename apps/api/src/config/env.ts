import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),

  SESSION_EXPIRES_IN_DAYS: z.coerce.number().default(30),

  MONGODB_URI: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.log(parsedEnv.error.flatten().fieldErrors);
  console.log("INVALID ENVIRONMENT VARIABLE");

  process.exit(1);
}

export const env = parsedEnv.data;
