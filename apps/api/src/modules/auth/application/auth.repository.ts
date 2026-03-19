import type { AccountSnapshot } from "../domain/auth.types";

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

export interface CreateAccountValues {
  email: string;
  passwordHash: string;
}

export interface CreateSessionValues {
  accountId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface AuthRepository {
  createAccount(values: CreateAccountValues): Promise<AccountSnapshot>;
  createSession(values: CreateSessionValues): Promise<void>;
  findAccountByEmail(email: string): Promise<AccountSnapshot | null>;
  findAccountById(accountId: string): Promise<AccountSnapshot | null>;
  findAccountByActiveSessionTokenHash(
    tokenHash: string,
    now: Date
  ): Promise<AccountSnapshot | null>;
}
