export type EquipmentSlot = "weapon" | "armor";

export interface ItemDefinition {
  id: string;
  name: string;
  type: string;
  price: number;
  equipSlot: EquipmentSlot;
  combatAttackBonus: number;
  combatDefenseBonus: number;
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
  type: string;
  price: number;
  equippedSlot: EquipmentSlot | null;
  marketListingId: string | null;
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
