"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketListingSettlementLockError = exports.MarketListingInsufficientCashError = exports.MarketListingSelfPurchaseError = exports.MarketListingNotActiveError = exports.MarketListingCancellationPermissionError = exports.MarketListingAlreadyActiveForItemError = exports.MarketListingEquippedItemError = exports.MarketListingOwnershipRequiredError = exports.MarketListingInventoryItemNotFoundError = exports.MarketListingPriceInvalidError = exports.MarketListingNotFoundError = void 0;
class MarketListingNotFoundError extends Error {
    constructor(listingId) {
        super(`Market listing "${listingId}" was not found.`);
        this.name = "MarketListingNotFoundError";
    }
}
exports.MarketListingNotFoundError = MarketListingNotFoundError;
class MarketListingPriceInvalidError extends Error {
    constructor(price) {
        super(`Market listing price "${price}" must be a positive whole number.`);
        this.name = "MarketListingPriceInvalidError";
    }
}
exports.MarketListingPriceInvalidError = MarketListingPriceInvalidError;
class MarketListingInventoryItemNotFoundError extends Error {
    constructor(inventoryItemId) {
        super(`Inventory item "${inventoryItemId}" was not found.`);
        this.name = "MarketListingInventoryItemNotFoundError";
    }
}
exports.MarketListingInventoryItemNotFoundError = MarketListingInventoryItemNotFoundError;
class MarketListingOwnershipRequiredError extends Error {
    constructor(inventoryItemId, playerId) {
        super(`Player "${playerId}" does not own inventory item "${inventoryItemId}".`);
        this.name = "MarketListingOwnershipRequiredError";
    }
}
exports.MarketListingOwnershipRequiredError = MarketListingOwnershipRequiredError;
class MarketListingEquippedItemError extends Error {
    constructor(inventoryItemId) {
        super(`Inventory item "${inventoryItemId}" is equipped and cannot be listed.`);
        this.name = "MarketListingEquippedItemError";
    }
}
exports.MarketListingEquippedItemError = MarketListingEquippedItemError;
class MarketListingAlreadyActiveForItemError extends Error {
    constructor(inventoryItemId) {
        super(`Inventory item "${inventoryItemId}" is already listed for sale.`);
        this.name = "MarketListingAlreadyActiveForItemError";
    }
}
exports.MarketListingAlreadyActiveForItemError = MarketListingAlreadyActiveForItemError;
class MarketListingCancellationPermissionError extends Error {
    constructor(listingId, playerId) {
        super(`Player "${playerId}" cannot cancel market listing "${listingId}".`);
        this.name = "MarketListingCancellationPermissionError";
    }
}
exports.MarketListingCancellationPermissionError = MarketListingCancellationPermissionError;
class MarketListingNotActiveError extends Error {
    constructor(listingId) {
        super(`Market listing "${listingId}" is not active.`);
        this.name = "MarketListingNotActiveError";
    }
}
exports.MarketListingNotActiveError = MarketListingNotActiveError;
class MarketListingSelfPurchaseError extends Error {
    constructor(listingId, playerId) {
        super(`Player "${playerId}" cannot buy their own listing "${listingId}".`);
        this.name = "MarketListingSelfPurchaseError";
    }
}
exports.MarketListingSelfPurchaseError = MarketListingSelfPurchaseError;
class MarketListingInsufficientCashError extends Error {
    constructor(listingId, playerId) {
        super(`Player "${playerId}" does not have enough cash to buy listing "${listingId}".`);
        this.name = "MarketListingInsufficientCashError";
    }
}
exports.MarketListingInsufficientCashError = MarketListingInsufficientCashError;
class MarketListingSettlementLockError extends Error {
    constructor(listingId) {
        super(`Market listing "${listingId}" could not settle because the inventory lock was missing.`);
        this.name = "MarketListingSettlementLockError";
    }
}
exports.MarketListingSettlementLockError = MarketListingSettlementLockError;
