export const INVENTORY_BALANCE_REPOSITORY = Symbol("INVENTORY_BALANCE_REPOSITORY");

export interface ShopItemBalanceRecord {
  itemId: string;
  price: number;
}

export interface InventoryBalanceRepository {
  listShopItemBalances(): Promise<ShopItemBalanceRecord[]>;
  upsertShopItemBalance(balance: ShopItemBalanceRecord): Promise<ShopItemBalanceRecord>;
}
