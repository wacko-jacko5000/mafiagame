export class InventoryItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`Item "${itemId}" was not found.`);
    this.name = "InventoryItemNotFoundError";
  }
}

export class InsufficientCashForItemError extends Error {
  constructor(itemId: string) {
    super(`Player does not have enough cash to purchase "${itemId}".`);
    this.name = "InsufficientCashForItemError";
  }
}

export class InventoryItemLevelLockedError extends Error {
  constructor(itemName: string, requiredLevel: number, requiredRank: string) {
    super(
      `Player must reach level ${requiredLevel} (${requiredRank}) to purchase "${itemName}".`
    );
    this.name = "InventoryItemLevelLockedError";
  }
}

export class InventoryItemEquipLevelLockedError extends Error {
  constructor(itemName: string, requiredLevel: number, requiredRank: string) {
    super(
      `Player must reach level ${requiredLevel} (${requiredRank}) to equip "${itemName}".`
    );
    this.name = "InventoryItemEquipLevelLockedError";
  }
}

export class InventoryOwnedItemNotFoundError extends Error {
  constructor(inventoryItemId: string) {
    super(`Owned inventory item "${inventoryItemId}" was not found.`);
    this.name = "InventoryOwnedItemNotFoundError";
  }
}

export class InventoryItemListedForSaleError extends Error {
  constructor(inventoryItemId: string) {
    super(`Owned inventory item "${inventoryItemId}" is currently listed for sale.`);
    this.name = "InventoryItemListedForSaleError";
  }
}

export class InvalidEquipmentSlotError extends Error {
  constructor(itemId: string, slot: string, expectedSlot: string) {
    super(
      `Item "${itemId}" cannot be equipped in "${slot}". Valid slot is "${expectedSlot}".`
    );
    this.name = "InvalidEquipmentSlotError";
  }
}

export class UnknownEquipmentSlotError extends Error {
  constructor(slot: string) {
    super(`Equipment slot "${slot}" is invalid.`);
    this.name = "UnknownEquipmentSlotError";
  }
}
