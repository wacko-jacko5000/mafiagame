export declare class InventoryItemNotFoundError extends Error {
    constructor(itemId: string);
}
export declare class InsufficientCashForItemError extends Error {
    constructor(itemId: string);
}
export declare class InventoryItemLevelLockedError extends Error {
    constructor(itemName: string, requiredLevel: number, requiredRank: string);
}
export declare class InventoryItemEquipLevelLockedError extends Error {
    constructor(itemName: string, requiredLevel: number, requiredRank: string);
}
export declare class InventoryOwnedItemNotFoundError extends Error {
    constructor(inventoryItemId: string);
}
export declare class InventoryItemListedForSaleError extends Error {
    constructor(inventoryItemId: string);
}
export declare class InvalidEquipmentSlotError extends Error {
    constructor(itemId: string, slot: string, expectedSlot: string);
}
export declare class UnknownEquipmentSlotError extends Error {
    constructor(slot: string);
}
