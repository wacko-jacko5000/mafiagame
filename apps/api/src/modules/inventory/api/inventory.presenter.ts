import type {
  InventoryListItem,
  PlayerShopItem,
  ShopCatalogItem,
  PurchaseInventoryItemResult
} from "../domain/inventory.types";
import type {
  EquippedItemsResponseBody,
  PlayerShopItemResponseBody,
  PlayerInventoryItemResponseBody,
  PurchaseItemResponseBody,
  ShopItemResponseBody
} from "./inventory.contracts";

export function toShopItemResponseBody(
  item: ShopCatalogItem
): ShopItemResponseBody {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    category: item.category,
    price: item.price,
    equipSlot: item.equipSlot,
    unlockLevel: item.unlockLevel,
    unlockRank: item.unlockRank,
    weaponStats: item.weaponStats,
    armorStats: item.armorStats
  };
}

export function toPlayerShopItemResponseBody(
  item: PlayerShopItem
): PlayerShopItemResponseBody {
  return {
    ...toShopItemResponseBody(item),
    isUnlocked: item.isUnlocked,
    isLocked: item.isLocked
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
    category: item.category,
    price: item.price,
    equipSlot: item.equipSlot,
    unlockLevel: item.unlockLevel,
    equippedSlot: item.equippedSlot,
    marketListingId: item.marketListingId,
    weaponStats: item.weaponStats,
    armorStats: item.armorStats,
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
