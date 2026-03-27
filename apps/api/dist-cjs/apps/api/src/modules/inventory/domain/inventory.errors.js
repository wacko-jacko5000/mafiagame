"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownEquipmentSlotError = exports.InvalidEquipmentSlotError = exports.InventoryItemListedForSaleError = exports.InventoryOwnedItemNotFoundError = exports.InventoryItemEquipLevelLockedError = exports.InventoryItemLevelLockedError = exports.InsufficientCashForItemError = exports.InventoryItemNotFoundError = void 0;
class InventoryItemNotFoundError extends Error {
    constructor(itemId) {
        super(`Item "${itemId}" was not found.`);
        this.name = "InventoryItemNotFoundError";
    }
}
exports.InventoryItemNotFoundError = InventoryItemNotFoundError;
class InsufficientCashForItemError extends Error {
    constructor(itemId) {
        super(`Player does not have enough cash to purchase "${itemId}".`);
        this.name = "InsufficientCashForItemError";
    }
}
exports.InsufficientCashForItemError = InsufficientCashForItemError;
class InventoryItemLevelLockedError extends Error {
    constructor(itemName, requiredLevel, requiredRank) {
        super(`Player must reach level ${requiredLevel} (${requiredRank}) to purchase "${itemName}".`);
        this.name = "InventoryItemLevelLockedError";
    }
}
exports.InventoryItemLevelLockedError = InventoryItemLevelLockedError;
class InventoryItemEquipLevelLockedError extends Error {
    constructor(itemName, requiredLevel, requiredRank) {
        super(`Player must reach level ${requiredLevel} (${requiredRank}) to equip "${itemName}".`);
        this.name = "InventoryItemEquipLevelLockedError";
    }
}
exports.InventoryItemEquipLevelLockedError = InventoryItemEquipLevelLockedError;
class InventoryOwnedItemNotFoundError extends Error {
    constructor(inventoryItemId) {
        super(`Owned inventory item "${inventoryItemId}" was not found.`);
        this.name = "InventoryOwnedItemNotFoundError";
    }
}
exports.InventoryOwnedItemNotFoundError = InventoryOwnedItemNotFoundError;
class InventoryItemListedForSaleError extends Error {
    constructor(inventoryItemId) {
        super(`Owned inventory item "${inventoryItemId}" is currently listed for sale.`);
        this.name = "InventoryItemListedForSaleError";
    }
}
exports.InventoryItemListedForSaleError = InventoryItemListedForSaleError;
class InvalidEquipmentSlotError extends Error {
    constructor(itemId, slot, expectedSlot) {
        super(`Item "${itemId}" cannot be equipped in "${slot}". Valid slot is "${expectedSlot}".`);
        this.name = "InvalidEquipmentSlotError";
    }
}
exports.InvalidEquipmentSlotError = InvalidEquipmentSlotError;
class UnknownEquipmentSlotError extends Error {
    constructor(slot) {
        super(`Equipment slot "${slot}" is invalid.`);
        this.name = "UnknownEquipmentSlotError";
    }
}
exports.UnknownEquipmentSlotError = UnknownEquipmentSlotError;
