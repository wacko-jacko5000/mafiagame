import type { EquipmentSlot, EquippedInventory, InventoryListItem, ItemDefinition, PlayerShopItem, ShopCatalogItem, PlayerInventoryItemSnapshot } from "./inventory.types";
export declare function toInventoryListItem(ownedItem: PlayerInventoryItemSnapshot, item: ItemDefinition): InventoryListItem;
export declare function buildInventoryList(ownedItems: readonly PlayerInventoryItemSnapshot[]): InventoryListItem[];
export declare function buildEquippedInventory(inventoryItems: readonly InventoryListItem[]): EquippedInventory;
export declare function validateEquipmentSlotCompatibility(item: ItemDefinition, slot: EquipmentSlot): void;
export declare function parseEquipmentSlot(slot: string): EquipmentSlot;
export declare function toShopCatalogItem(item: ItemDefinition, unlockRank: string): ShopCatalogItem;
export declare function toPlayerShopItem(item: ItemDefinition, unlockRank: string, playerLevel: number): PlayerShopItem;
