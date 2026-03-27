export type ShopItemCategoryResponseBody = "handguns" | "smg" | "assault_rifle" | "sniper" | "special" | "armor";
export interface ShopItemResponseBody {
    id: string;
    name: string;
    type: "weapon" | "armor";
    category: ShopItemCategoryResponseBody;
    price: number;
    equipSlot: "weapon" | "armor";
    unlockLevel: number;
    unlockRank: string;
    weaponStats: {
        damageBonus: number;
    } | null;
    armorStats: {
        damageReduction: number;
    } | null;
}
export interface PlayerShopItemResponseBody extends ShopItemResponseBody {
    isUnlocked: boolean;
    isLocked: boolean;
}
export interface PlayerInventoryItemResponseBody {
    id: string;
    playerId: string;
    itemId: string;
    name: string;
    type: "weapon" | "armor";
    category: ShopItemCategoryResponseBody;
    price: number;
    equipSlot: "weapon" | "armor";
    unlockLevel: number;
    equippedSlot: "weapon" | "armor" | null;
    marketListingId: string | null;
    weaponStats: {
        damageBonus: number;
    } | null;
    armorStats: {
        damageReduction: number;
    } | null;
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
