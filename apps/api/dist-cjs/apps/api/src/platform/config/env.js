"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(3001),
    DATABASE_URL: zod_1.z.string().min(1),
    ADMIN_API_KEY: zod_1.z.string().min(1).optional(),
    ADMIN_EMAILS: zod_1.z.string().optional()
});
function validateEnv(input) {
    return envSchema.parse(input);
}
