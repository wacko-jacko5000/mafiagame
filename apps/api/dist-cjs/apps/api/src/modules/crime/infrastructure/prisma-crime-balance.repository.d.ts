import { PrismaService } from "../../../platform/database/prisma.service";
import type { CrimeBalanceRecord, CrimeBalanceRepository } from "../application/crime-balance.repository";
export declare class PrismaCrimeBalanceRepository implements CrimeBalanceRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    listCrimeBalances(): Promise<CrimeBalanceRecord[]>;
    upsertCrimeBalance(balance: CrimeBalanceRecord): Promise<CrimeBalanceRecord>;
}
