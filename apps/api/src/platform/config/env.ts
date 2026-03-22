import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  ADMIN_API_KEY: z.string().min(1).optional(),
  ADMIN_EMAILS: z.string().optional()
});

export type RuntimeEnv = z.infer<typeof envSchema>;

export function validateEnv(input: Record<string, unknown>): RuntimeEnv {
  return envSchema.parse(input);
}
