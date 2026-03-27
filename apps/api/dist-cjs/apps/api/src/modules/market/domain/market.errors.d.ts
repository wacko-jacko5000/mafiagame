export declare class MarketListingNotFoundError extends Error {
    constructor(listingId: string);
}
export declare class MarketListingPriceInvalidError extends Error {
    constructor(price: number);
}
export declare class MarketListingInventoryItemNotFoundError extends Error {
    constructor(inventoryItemId: string);
}
export declare class MarketListingOwnershipRequiredError extends Error {
    constructor(inventoryItemId: string, playerId: string);
}
export declare class MarketListingEquippedItemError extends Error {
    constructor(inventoryItemId: string);
}
export declare class MarketListingAlreadyActiveForItemError extends Error {
    constructor(inventoryItemId: string);
}
export declare class MarketListingCancellationPermissionError extends Error {
    constructor(listingId: string, playerId: string);
}
export declare class MarketListingNotActiveError extends Error {
    constructor(listingId: string);
}
export declare class MarketListingSelfPurchaseError extends Error {
    constructor(listingId: string, playerId: string);
}
export declare class MarketListingInsufficientCashError extends Error {
    constructor(listingId: string, playerId: string);
}
export declare class MarketListingSettlementLockError extends Error {
    constructor(listingId: string);
}
