import { PrismaService } from "../../../platform/database/prisma.service";
import type { InventoryBalanceRepository, ShopItemBalanceRecord } from "../application/inventory-balance.repository";
export declare class PrismaInventoryBalanceRepository implements InventoryBalanceRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    listShopItemBalances(): Promise<ShopItemBalanceRecord[]>;
    upsertShopItemBalance(balance: ShopItemBalanceRecord): Promise<ShopItemBalanceRecord>;
}
