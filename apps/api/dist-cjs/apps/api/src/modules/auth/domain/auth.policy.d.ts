export declare const AUTH_SESSION_TTL_DAYS = 30;
export declare function normalizeEmail(email: string): string;
export declare function assertValidPassword(password: string): void;
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, storedHash: string): Promise<boolean>;
export declare function generateSessionToken(): string;
export declare function hashSessionToken(token: string): string;
