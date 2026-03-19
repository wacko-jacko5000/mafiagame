import { getItemById } from "./inventory.catalog";
import type {
  EquipmentSlot,
  EquippedInventory,
  InventoryListItem,
  ItemDefinition,
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
    price: item.price,
    equippedSlot: ownedItem.equippedSlot,
    marketListingId: ownedItem.marketListingId,
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
