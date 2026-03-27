"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toShopItemResponseBody = toShopItemResponseBody;
exports.toPlayerShopItemResponseBody = toPlayerShopItemResponseBody;
exports.toPlayerInventoryItemResponseBody = toPlayerInventoryItemResponseBody;
exports.toPurchaseItemResponseBody = toPurchaseItemResponseBody;
exports.toEquippedItemsResponseBody = toEquippedItemsResponseBody;
function toShopItemResponseBody(item) {
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
        weaponStats: item.weaponStats,
        armorStats: item.armorStats,
        consumableEffects: item.consumableEffects ? [...item.consumableEffects] : null
    };
}
function toPlayerShopItemResponseBody(item) {
    return {
        ...toShopItemResponseBody(item),
        isUnlocked: item.isUnlocked,
        isLocked: item.isLocked
    };
}
function toPlayerInventoryItemResponseBody(item) {
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
function toPurchaseItemResponseBody(result) {
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
function toEquippedItemsResponseBody(equippedItems) {
    return {
        weapon: equippedItems.weapon
            ? toPlayerInventoryItemResponseBody(equippedItems.weapon)
            : null,
        armor: equippedItems.armor
            ? toPlayerInventoryItemResponseBody(equippedItems.armor)
            : null
    };
}
