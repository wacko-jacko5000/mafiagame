export type EquipmentSlot = "weapon" | "armor";
export type ItemType = "weapon" | "armor";
export type ShopItemCategory = "handguns" | "smg" | "assault_rifle" | "sniper" | "special" | "armor";
export interface WeaponItemStats {
    damageBonus: number;
}
export interface ArmorItemStats {
    damageReduction: number;
}
export interface ItemDefinition {
    id: string;
    name: string;
    type: ItemType;
    category: ShopItemCategory;
    price: number;
    equipSlot: EquipmentSlot;
    unlockLevel: number;
    weaponStats: WeaponItemStats | null;
    armorStats: ArmorItemStats | null;
}
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
    type: ItemType;
    category: ShopItemCategory;
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
    item: ItemDefinition;
}
export interface PurchaseInventoryItemResult {
    playerCashAfterPurchase: number;
    ownedItem: InventoryListItem;
}
export interface ShopCatalogItem {
    id: string;
    name: string;
    type: ItemType;
    category: ShopItemCategory;
    price: number;
    equipSlot: EquipmentSlot;
    unlockLevel: number;
    unlockRank: string;
    weaponStats: WeaponItemStats | null;
    armorStats: ArmorItemStats | null;
}
export interface PlayerShopItem extends ShopCatalogItem {
    isUnlocked: boolean;
    isLocked: boolean;
}
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
