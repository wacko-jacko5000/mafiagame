import { PrismaService } from "../../../platform/database/prisma.service";
import type { CustodyBalanceRepository, CustodyBuyoutConfigRecord, CustodyBuyoutLevelRecord } from "../application/custody-balance.repository";
export declare class PrismaCustodyBalanceRepository implements CustodyBalanceRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    listConfigs(): Promise<CustodyBuyoutConfigRecord[]>;
    upsertConfig(config: CustodyBuyoutConfigRecord): Promise<CustodyBuyoutConfigRecord>;
    listLevelBalances(): Promise<CustodyBuyoutLevelRecord[]>;
    upsertLevelBalance(balance: CustodyBuyoutLevelRecord): Promise<CustodyBuyoutLevelRecord>;
}
