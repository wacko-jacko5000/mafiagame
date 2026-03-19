export class MarketListingNotFoundError extends Error {
  constructor(listingId: string) {
    super(`Market listing "${listingId}" was not found.`);
    this.name = "MarketListingNotFoundError";
  }
}

export class MarketListingPriceInvalidError extends Error {
  constructor(price: number) {
    super(`Market listing price "${price}" must be a positive whole number.`);
    this.name = "MarketListingPriceInvalidError";
  }
}

export class MarketListingInventoryItemNotFoundError extends Error {
  constructor(inventoryItemId: string) {
    super(`Inventory item "${inventoryItemId}" was not found.`);
    this.name = "MarketListingInventoryItemNotFoundError";
  }
}

export class MarketListingOwnershipRequiredError extends Error {
  constructor(inventoryItemId: string, playerId: string) {
    super(`Player "${playerId}" does not own inventory item "${inventoryItemId}".`);
    this.name = "MarketListingOwnershipRequiredError";
  }
}

export class MarketListingEquippedItemError extends Error {
  constructor(inventoryItemId: string) {
    super(`Inventory item "${inventoryItemId}" is equipped and cannot be listed.`);
    this.name = "MarketListingEquippedItemError";
  }
}

export class MarketListingAlreadyActiveForItemError extends Error {
  constructor(inventoryItemId: string) {
    super(`Inventory item "${inventoryItemId}" is already listed for sale.`);
    this.name = "MarketListingAlreadyActiveForItemError";
  }
}

export class MarketListingCancellationPermissionError extends Error {
  constructor(listingId: string, playerId: string) {
    super(`Player "${playerId}" cannot cancel market listing "${listingId}".`);
    this.name = "MarketListingCancellationPermissionError";
  }
}

export class MarketListingNotActiveError extends Error {
  constructor(listingId: string) {
    super(`Market listing "${listingId}" is not active.`);
    this.name = "MarketListingNotActiveError";
  }
}

export class MarketListingSelfPurchaseError extends Error {
  constructor(listingId: string, playerId: string) {
    super(`Player "${playerId}" cannot buy their own listing "${listingId}".`);
    this.name = "MarketListingSelfPurchaseError";
  }
}

export class MarketListingInsufficientCashError extends Error {
  constructor(listingId: string, playerId: string) {
    super(`Player "${playerId}" does not have enough cash to buy listing "${listingId}".`);
    this.name = "MarketListingInsufficientCashError";
  }
}

export class MarketListingSettlementLockError extends Error {
  constructor(listingId: string) {
    super(`Market listing "${listingId}" could not settle because the inventory lock was missing.`);
    this.name = "MarketListingSettlementLockError";
  }
}
