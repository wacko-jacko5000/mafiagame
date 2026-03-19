import type {
  InventoryListItem,
  ItemDefinition,
  PurchaseInventoryItemResult
} from "../domain/inventory.types";
import type {
  EquippedItemsResponseBody,
  PlayerInventoryItemResponseBody,
  PurchaseItemResponseBody,
  ShopItemResponseBody
} from "./inventory.contracts";

export function toShopItemResponseBody(
  item: ItemDefinition
): ShopItemResponseBody {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    price: item.price,
    equipSlot: item.equipSlot
  };
}

export function toPlayerInventoryItemResponseBody(
  item: InventoryListItem
): PlayerInventoryItemResponseBody {
  return {
    id: item.id,
    playerId: item.playerId,
    itemId: item.itemId,
    name: item.name,
    type: item.type,
    price: item.price,
    equippedSlot: item.equippedSlot,
    marketListingId: item.marketListingId,
    acquiredAt: item.acquiredAt.toISOString()
  };
}

export function toPurchaseItemResponseBody(
  result: PurchaseInventoryItemResult
): PurchaseItemResponseBody {
  return {
    playerCashAfterPurchase: result.playerCashAfterPurchase,
    ownedItem: toPlayerInventoryItemResponseBody(result.ownedItem)
  };
}

export function toEquippedItemsResponseBody(
  equippedItems: { weapon: InventoryListItem | null; armor: InventoryListItem | null }
): EquippedItemsResponseBody {
  return {
    weapon: equippedItems.weapon
      ? toPlayerInventoryItemResponseBody(equippedItems.weapon)
      : null,
    armor: equippedItems.armor
      ? toPlayerInventoryItemResponseBody(equippedItems.armor)
      : null
  };
}
