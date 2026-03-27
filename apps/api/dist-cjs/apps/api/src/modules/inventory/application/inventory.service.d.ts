import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import type { EquippedInventory, InventoryCombatLoadout, InventoryListItem, PlayerShopItem, PurchaseInventoryItemResult, ShopCatalogItem } from "../domain/inventory.types";
import { type InventoryRepository } from "./inventory.repository";
export declare class InventoryService {
    private readonly playerService;
    private readonly domainEventsService;
    private readonly inventoryRepository;
    constructor(playerService: PlayerService, domainEventsService: DomainEventsService, inventoryRepository: InventoryRepository);
    listShopItems(): ShopCatalogItem[];
    listShopItemsForPlayer(playerId: string): Promise<PlayerShopItem[]>;
    listPlayerInventory(playerId: string): Promise<InventoryListItem[]>;
    getEquippedItems(playerId: string): Promise<EquippedInventory>;
    getCombatLoadout(playerId: string): Promise<InventoryCombatLoadout>;
    purchaseItem(playerId: string, itemId: string): Promise<PurchaseInventoryItemResult>;
    equipItem(playerId: string, inventoryItemId: string, slot: string): Promise<InventoryListItem>;
    unequipSlot(playerId: string, slot: string): Promise<InventoryListItem | null>;
    private parseSlotOrThrow;
    private getUnlockRankName;
}
