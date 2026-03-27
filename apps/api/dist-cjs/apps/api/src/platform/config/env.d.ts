import { z } from "zod";
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    DATABASE_URL: z.ZodString;
    ADMIN_API_KEY: z.ZodOptional<z.ZodString>;
    ADMIN_EMAILS: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    DATABASE_URL: string;
    ADMIN_EMAILS?: string | undefined;
    ADMIN_API_KEY?: string | undefined;
}, {
    DATABASE_URL: string;
    ADMIN_EMAILS?: string | undefined;
    NODE_ENV?: "development" | "test" | "production" | undefined;
    PORT?: number | undefined;
    ADMIN_API_KEY?: string | undefined;
}>;
export type RuntimeEnv = z.infer<typeof envSchema>;
export declare function validateEnv(input: Record<string, unknown>): RuntimeEnv;
export {};
