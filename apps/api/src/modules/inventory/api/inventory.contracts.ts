export interface ShopItemResponseBody {
  id: string;
  name: string;
  type: string;
  price: number;
  equipSlot: "weapon" | "armor";
}

export interface PlayerInventoryItemResponseBody {
  id: string;
  playerId: string;
  itemId: string;
  name: string;
  type: string;
  price: number;
  equippedSlot: "weapon" | "armor" | null;
  marketListingId: string | null;
  acquiredAt: string;
}

export interface PurchaseItemResponseBody {
  playerCashAfterPurchase: number;
  ownedItem: PlayerInventoryItemResponseBody;
}

export interface EquippedItemsResponseBody {
  weapon: PlayerInventoryItemResponseBody | null;
  armor: PlayerInventoryItemResponseBody | null;
}
