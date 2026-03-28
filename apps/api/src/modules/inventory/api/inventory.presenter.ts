import type {
  InventoryListItem,
  PlayerShopItem,
  ShopCatalogItem,
  PurchaseShopItemResult
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
    delivery: item.delivery,
    equipSlot: item.equipSlot,
    unlockLevel: item.unlockLevel,
    unlockRank: item.unlockRank,
    respectBonus: item.respectBonus,
    parkingSlots: item.parkingSlots,
    weaponStats: item.weaponStats,
    armorStats: item.armorStats,
    consumableEffects: item.consumableEffects ? [...item.consumableEffects] : null
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
    respectBonus: item.respectBonus,
    parkingSlots: item.parkingSlots,
    equippedSlot: item.equippedSlot,
    marketListingId: item.marketListingId,
    weaponStats: item.weaponStats,
    armorStats: item.armorStats,
    acquiredAt: item.acquiredAt.toISOString()
  };
}

export function toPurchaseItemResponseBody(
  result: PurchaseShopItemResult
): PurchaseItemResponseBody {
  if (result.delivery === "inventory") {
    return {
      delivery: "inventory",
      playerCashAfterPurchase: result.playerCashAfterPurchase,
      playerEnergyAfterPurchase: null,
      playerHealthAfterPurchase: null,
      ownedItem: toPlayerInventoryItemResponseBody(result.ownedItem),
      consumedItem: null
    };
  }

  return {
    delivery: "instant",
    playerCashAfterPurchase: result.playerCashAfterPurchase,
    playerEnergyAfterPurchase: result.playerEnergyAfterPurchase,
    playerHealthAfterPurchase: result.playerHealthAfterPurchase,
    ownedItem: null,
    consumedItem: toShopItemResponseBody(result.consumedItem)
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
