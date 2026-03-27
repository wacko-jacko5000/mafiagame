"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toInventoryListItem = toInventoryListItem;
exports.buildInventoryList = buildInventoryList;
exports.buildEquippedInventory = buildEquippedInventory;
exports.validateEquipmentSlotCompatibility = validateEquipmentSlotCompatibility;
exports.parseEquipmentSlot = parseEquipmentSlot;
exports.toShopCatalogItem = toShopCatalogItem;
exports.toPlayerShopItem = toPlayerShopItem;
const inventory_catalog_1 = require("./inventory.catalog");
function toInventoryListItem(ownedItem, item) {
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
function buildInventoryList(ownedItems) {
    return ownedItems.flatMap((ownedItem) => {
        const item = (0, inventory_catalog_1.getEquipmentItemById)(ownedItem.itemId);
        if (!item) {
            return [];
        }
        return [toInventoryListItem(ownedItem, item)];
    });
}
function buildEquippedInventory(inventoryItems) {
    const initialState = {
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
function validateEquipmentSlotCompatibility(item, slot) {
    if (item.equipSlot !== slot) {
        throw new Error(`Item "${item.id}" cannot be equipped in "${slot}". Valid slot is "${item.equipSlot}".`);
    }
}
function parseEquipmentSlot(slot) {
    if (slot === "weapon" || slot === "armor") {
        return slot;
    }
    throw new Error(`Equipment slot "${slot}" is invalid.`);
}
function toShopCatalogItem(item, unlockRank) {
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
        weaponStats: item.weaponStats,
        armorStats: item.armorStats,
        consumableEffects: item.consumableEffects
    };
}
function toPlayerShopItem(item, unlockRank, playerLevel) {
    const isUnlocked = playerLevel >= item.unlockLevel;
    return {
        ...toShopCatalogItem(item, unlockRank),
        isUnlocked,
        isLocked: !isUnlocked
    };
}
