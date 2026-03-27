import { PrismaService } from "../../../platform/database/prisma.service";
import type { AuthRepository, CreateAccountValues, CreateSessionValues } from "../application/auth.repository";
import type { AccountSnapshot } from "../domain/auth.types";
export declare class PrismaAuthRepository implements AuthRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    createAccount(values: CreateAccountValues): Promise<AccountSnapshot>;
    createSession(values: CreateSessionValues): Promise<void>;
    findAccountByEmail(email: string): Promise<AccountSnapshot | null>;
    findAccountById(accountId: string): Promise<AccountSnapshot | null>;
    markAccountAsAdmin(accountId: string): Promise<AccountSnapshot>;
    findAccountByActiveSessionTokenHash(tokenHash: string, now: Date): Promise<AccountSnapshot | null>;
}
