import { getItemById } from "./inventory.catalog";
import type {
  EquipmentSlot,
  EquippedInventory,
  InventoryListItem,
  ItemDefinition,
  PlayerShopItem,
  ShopCatalogItem,
  PlayerInventoryItemSnapshot
} from "./inventory.types";

export function toInventoryListItem(
  ownedItem: PlayerInventoryItemSnapshot,
  item: ItemDefinition
): InventoryListItem {
  return {
    id: ownedItem.id,
    playerId: ownedItem.playerId,
    itemId: item.id,
    name: item.name,
    type: item.type,
    category: item.category,
    price: item.price,
    equipSlot: item.equipSlot,
    unlockLevel: item.unlockLevel,
    equippedSlot: ownedItem.equippedSlot,
    marketListingId: ownedItem.marketListingId,
    weaponStats: item.weaponStats,
    armorStats: item.armorStats,
    acquiredAt: ownedItem.acquiredAt
  };
}

export function buildInventoryList(
  ownedItems: readonly PlayerInventoryItemSnapshot[]
): InventoryListItem[] {
  return ownedItems.flatMap((ownedItem) => {
    const item = getItemById(ownedItem.itemId);

    if (!item) {
      return [];
    }

    return [toInventoryListItem(ownedItem, item)];
  });
}

export function buildEquippedInventory(
  inventoryItems: readonly InventoryListItem[]
): EquippedInventory {
  const initialState: EquippedInventory = {
    weapon: null,
    armor: null
  };

  for (const item of inventoryItems) {
    if (item.equippedSlot) {
      initialState[item.equippedSlot] = item;
    }
  }

  return initialState;
}

export function validateEquipmentSlotCompatibility(
  item: ItemDefinition,
  slot: EquipmentSlot
): void {
  if (item.equipSlot !== slot) {
    throw new Error(
      `Item "${item.id}" cannot be equipped in "${slot}". Valid slot is "${item.equipSlot}".`
    );
  }
}

export function parseEquipmentSlot(slot: string): EquipmentSlot {
  if (slot === "weapon" || slot === "armor") {
    return slot;
  }

  throw new Error(`Equipment slot "${slot}" is invalid.`);
}

export function toShopCatalogItem(
  item: ItemDefinition,
  unlockRank: string
): ShopCatalogItem {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    category: item.category,
    price: item.price,
    equipSlot: item.equipSlot,
    unlockLevel: item.unlockLevel,
    unlockRank,
    weaponStats: item.weaponStats,
    armorStats: item.armorStats
  };
}

export function toPlayerShopItem(
  item: ItemDefinition,
  unlockRank: string,
  playerLevel: number
): PlayerShopItem {
  const isUnlocked = playerLevel >= item.unlockLevel;

  return {
    ...toShopCatalogItem(item, unlockRank),
    isUnlocked,
    isLocked: !isUnlocked
  };
}
