export type ShopItemCategoryResponseBody =
  | "handguns"
  | "smg"
  | "assault_rifle"
  | "sniper"
  | "special"
  | "armor"
  | "drugs";

export interface ShopItemResponseBody {
  id: string;
  name: string;
  type: "weapon" | "armor" | "consumable";
  category: ShopItemCategoryResponseBody;
  price: number;
  delivery: "inventory" | "instant";
  equipSlot: "weapon" | "armor" | null;
  unlockLevel: number;
  unlockRank: string;
  weaponStats: {
    damageBonus: number;
  } | null;
  armorStats: {
    damageReduction: number;
  } | null;
  consumableEffects: Array<{
    type: "resource";
    resource: "energy" | "health";
    amount: number;
  }> | null;
}

export interface PlayerShopItemResponseBody extends ShopItemResponseBody {
  isUnlocked: boolean;
  isLocked: boolean;
}

export interface PlayerInventoryItemResponseBody {
  id: string;
  playerId: string;
  itemId: string;
  name: string;
  type: "weapon" | "armor";
  category: Exclude<ShopItemCategoryResponseBody, "drugs">;
  price: number;
  equipSlot: "weapon" | "armor";
  unlockLevel: number;
  equippedSlot: "weapon" | "armor" | null;
  marketListingId: string | null;
  weaponStats: {
    damageBonus: number;
  } | null;
  armorStats: {
    damageReduction: number;
  } | null;
  acquiredAt: string;
}

export interface PurchaseInventoryItemResponseBody {
  delivery: "inventory";
  playerCashAfterPurchase: number;
  playerEnergyAfterPurchase: null;
  playerHealthAfterPurchase: null;
  ownedItem: PlayerInventoryItemResponseBody;
  consumedItem: null;
}

export interface PurchaseConsumableItemResponseBody {
  delivery: "instant";
  playerCashAfterPurchase: number;
  playerEnergyAfterPurchase: number;
  playerHealthAfterPurchase: number;
  ownedItem: null;
  consumedItem: ShopItemResponseBody;
}

export type PurchaseItemResponseBody =
  | PurchaseInventoryItemResponseBody
  | PurchaseConsumableItemResponseBody;

export interface EquippedItemsResponseBody {
  weapon: PlayerInventoryItemResponseBody | null;
  armor: PlayerInventoryItemResponseBody | null;
}
