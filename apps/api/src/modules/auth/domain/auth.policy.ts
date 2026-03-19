import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import {
  InvalidAuthEmailError,
  InvalidAuthPasswordError
} from "./auth.errors";

const scrypt = promisify(scryptCallback);

export const AUTH_SESSION_TTL_DAYS = 30;

export function normalizeEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new InvalidAuthEmailError();
  }

  return normalizedEmail;
}

export function assertValidPassword(password: string): void {
  if (password.length < 8) {
    throw new InvalidAuthPasswordError();
  }
}

export async function hashPassword(password: string): Promise<string> {
  assertValidPassword(password);

  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, hashedPassword] = storedHash.split(":");

  if (!salt || !hashedPassword) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(hashedPassword, "hex");
  const derivedBuffer = Buffer.from(derivedKey);

  if (storedBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedBuffer);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
