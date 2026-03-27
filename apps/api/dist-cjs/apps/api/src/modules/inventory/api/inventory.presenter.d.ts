import type { InventoryListItem, PlayerShopItem, ShopCatalogItem, PurchaseInventoryItemResult } from "../domain/inventory.types";
import type { EquippedItemsResponseBody, PlayerShopItemResponseBody, PlayerInventoryItemResponseBody, PurchaseItemResponseBody, ShopItemResponseBody } from "./inventory.contracts";
export declare function toShopItemResponseBody(item: ShopCatalogItem): ShopItemResponseBody;
export declare function toPlayerShopItemResponseBody(item: PlayerShopItem): PlayerShopItemResponseBody;
export declare function toPlayerInventoryItemResponseBody(item: InventoryListItem): PlayerInventoryItemResponseBody;
export declare function toPurchaseItemResponseBody(result: PurchaseInventoryItemResult): PurchaseItemResponseBody;
export declare function toEquippedItemsResponseBody(equippedItems: {
    weapon: InventoryListItem | null;
    armor: InventoryListItem | null;
}): EquippedItemsResponseBody;
