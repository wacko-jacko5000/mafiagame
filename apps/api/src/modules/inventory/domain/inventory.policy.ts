import { getOwnedShopItemById } from "./inventory.catalog";
import type {
  EquipmentSlot,
  EquippedInventory,
  InventoryListItem,
  EquipmentItemDefinition,
  OwnedShopItemDefinition,
  PlayerShopItem,
  ShopCatalogItem,
  ShopItemDefinition,
  PlayerInventoryItemSnapshot
} from "./inventory.types";

export function toInventoryListItem(
  ownedItem: PlayerInventoryItemSnapshot,
  item: OwnedShopItemDefinition
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
    respectBonus: item.respectBonus,
    parkingSlots: item.parkingSlots,
    equippedSlot: ownedItem.equippedSlot,
    marketListingId: ownedItem.marketListingId,
    weaponStats: item.weaponStats,
    armorStats: item.armorStats,
    acquiredAt: ownedItem.acquiredAt
  };
}

export function buildInventoryList(
  ownedItems: readonly PlayerInventoryItemSnapshot[],
  resolveItem: (itemId: string) => OwnedShopItemDefinition | undefined = getOwnedShopItemById
): InventoryListItem[] {
  return ownedItems.flatMap((ownedItem) => {
    const item = resolveItem(ownedItem.itemId);

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
  item: EquipmentItemDefinition,
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
  item: ShopItemDefinition,
  unlockRank: string
): ShopCatalogItem {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    category: item.category,
    price: item.price,
    delivery: item.delivery,
    equipSlot: item.equipSlot,
    unlockLevel: item.unlockLevel,
    unlockRank,
    respectBonus: item.respectBonus,
    parkingSlots: item.parkingSlots,
    weaponStats: item.weaponStats,
    armorStats: item.armorStats,
    consumableEffects: item.consumableEffects
  };
}

export function toPlayerShopItem(
  item: ShopItemDefinition,
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
