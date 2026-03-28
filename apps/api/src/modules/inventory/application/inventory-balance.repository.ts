export const INVENTORY_BALANCE_REPOSITORY = Symbol("INVENTORY_BALANCE_REPOSITORY");

export interface ShopItemBalanceRecord {
  itemId: string;
  name: string | null;
  type: string | null;
  category: string | null;
  delivery: string | null;
  equipSlot: string | null;
  unlockLevel: number | null;
  respectBonus: number | null;
  parkingSlots: number | null;
  damageBonus: number | null;
  damageReduction: number | null;
  resourceEffectResource: string | null;
  resourceEffectAmount: number | null;
  archived: boolean | null;
  price: number;
}

export interface InventoryBalanceRepository {
  listShopItemBalances(): Promise<ShopItemBalanceRecord[]>;
  upsertShopItemBalance(balance: ShopItemBalanceRecord): Promise<ShopItemBalanceRecord>;
}
