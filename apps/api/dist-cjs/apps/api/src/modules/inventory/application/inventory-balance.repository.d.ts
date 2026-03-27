export declare const INVENTORY_BALANCE_REPOSITORY: unique symbol;
export interface ShopItemBalanceRecord {
    itemId: string;
    price: number;
}
export interface InventoryBalanceRepository {
    listShopItemBalances(): Promise<ShopItemBalanceRecord[]>;
    upsertShopItemBalance(balance: ShopItemBalanceRecord): Promise<ShopItemBalanceRecord>;
}
