export type EquipmentSlot = "weapon" | "armor";
export type EquipmentItemType = "weapon" | "armor";
export type ShopItemType = EquipmentItemType | "consumable";
export type EquipmentShopItemCategory =
  | "handguns"
  | "smg"
  | "assault_rifle"
  | "sniper"
  | "special"
  | "armor";
export type ShopItemCategory = EquipmentShopItemCategory | "drugs";
export type ConsumableEffectResource = "energy" | "health";

export interface WeaponItemStats {
  damageBonus: number;
}

export interface ArmorItemStats {
  damageReduction: number;
}

export interface ResourceConsumableEffect {
  type: "resource";
  resource: ConsumableEffectResource;
  amount: number;
}

export type ConsumableEffect = ResourceConsumableEffect;

interface BaseShopItemDefinition {
  id: string;
  name: string;
  price: number;
  unlockLevel: number;
}

export interface ItemDefinition extends BaseShopItemDefinition {
  type: EquipmentItemType;
  category: EquipmentShopItemCategory;
  delivery?: "inventory";
  equipSlot: EquipmentSlot;
  weaponStats: WeaponItemStats | null;
  armorStats: ArmorItemStats | null;
  consumableEffects?: null;
}

export interface EquipmentItemDefinition extends ItemDefinition {
  delivery: "inventory";
  consumableEffects: null;
}

export interface ConsumableItemDefinition extends BaseShopItemDefinition {
  type: "consumable";
  category: "drugs";
  delivery: "instant";
  equipSlot: null;
  weaponStats: null;
  armorStats: null;
  consumableEffects: readonly ConsumableEffect[];
}

export type ShopItemDefinition = EquipmentItemDefinition | ConsumableItemDefinition;
export type ItemType = EquipmentItemType;

export interface PlayerInventoryItemSnapshot {
  id: string;
  playerId: string;
  itemId: string;
  equippedSlot: EquipmentSlot | null;
  marketListingId: string | null;
  acquiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryListItem {
  id: string;
  playerId: string;
  itemId: string;
  name: string;
  type: EquipmentItemType;
  category: EquipmentShopItemCategory;
  price: number;
  equipSlot: EquipmentSlot;
  unlockLevel: number;
  equippedSlot: EquipmentSlot | null;
  marketListingId: string | null;
  weaponStats: WeaponItemStats | null;
  armorStats: ArmorItemStats | null;
  acquiredAt: Date;
}

export interface PurchaseInventoryItemCommand {
  playerId: string;
  item: EquipmentItemDefinition;
}

export interface ShopCatalogItem {
  id: string;
  name: string;
  type: ShopItemType;
  category: ShopItemCategory;
  price: number;
  delivery: "inventory" | "instant";
  equipSlot: EquipmentSlot | null;
  unlockLevel: number;
  unlockRank: string;
  weaponStats: WeaponItemStats | null;
  armorStats: ArmorItemStats | null;
  consumableEffects: readonly ConsumableEffect[] | null;
}

export interface PlayerShopItem extends ShopCatalogItem {
  isUnlocked: boolean;
  isLocked: boolean;
}

export interface PurchaseEquipmentItemResult {
  delivery: "inventory";
  playerCashAfterPurchase: number;
  playerEnergyAfterPurchase: number | null;
  playerHealthAfterPurchase: number | null;
  ownedItem: InventoryListItem;
  consumedItem: null;
}

export interface PurchaseConsumableItemResult {
  delivery: "instant";
  playerCashAfterPurchase: number;
  playerEnergyAfterPurchase: number;
  playerHealthAfterPurchase: number;
  ownedItem: null;
  consumedItem: ShopCatalogItem;
}

export type PurchaseShopItemResult =
  | PurchaseEquipmentItemResult
  | PurchaseConsumableItemResult;

export interface EquipInventoryItemCommand {
  playerId: string;
  inventoryItemId: string;
  slot: EquipmentSlot;
}

export interface EquippedInventory {
  weapon: InventoryListItem | null;
  armor: InventoryListItem | null;
}

export interface InventoryCombatLoadout {
  weapon: {
    inventoryItemId: string;
    itemId: string;
    attackBonus: number;
  } | null;
  armor: {
    inventoryItemId: string;
    itemId: string;
    defenseBonus: number;
  } | null;
}
