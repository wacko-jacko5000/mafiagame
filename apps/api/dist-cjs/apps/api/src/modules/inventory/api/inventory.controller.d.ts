import type { AuthActor } from "../../auth/domain/auth.types";
import { InventoryService } from "../application/inventory.service";
import type { EquippedItemsResponseBody, PlayerShopItemResponseBody, PlayerInventoryItemResponseBody, PurchaseItemResponseBody, ShopItemResponseBody } from "./inventory.contracts";
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getShopItems(): ShopItemResponseBody[];
    getCurrentPlayerShopItems(actor: AuthActor | undefined): Promise<PlayerShopItemResponseBody[]>;
    getPlayerInventory(playerId: string): Promise<PlayerInventoryItemResponseBody[]>;
    getEquippedItems(playerId: string): Promise<EquippedItemsResponseBody>;
    getCurrentPlayerInventory(actor: AuthActor | undefined): Promise<PlayerInventoryItemResponseBody[]>;
    getCurrentEquippedItems(actor: AuthActor | undefined): Promise<EquippedItemsResponseBody>;
    purchaseItem(playerId: string, itemId: string): Promise<PurchaseItemResponseBody>;
    purchaseCurrentPlayerItem(itemId: string, actor: AuthActor | undefined): Promise<PurchaseItemResponseBody>;
    equipItem(playerId: string, inventoryItemId: string, slot: string): Promise<PlayerInventoryItemResponseBody>;
    equipCurrentPlayerItem(inventoryItemId: string, slot: string, actor: AuthActor | undefined): Promise<PlayerInventoryItemResponseBody>;
    unequipSlot(playerId: string, slot: string): Promise<PlayerInventoryItemResponseBody | null>;
    unequipCurrentPlayerSlot(slot: string, actor: AuthActor | undefined): Promise<PlayerInventoryItemResponseBody | null>;
}
