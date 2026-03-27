import type { EquipInventoryItemCommand, PlayerInventoryItemSnapshot, PurchaseInventoryItemCommand, PurchaseInventoryItemResult } from "../domain/inventory.types";
export declare const INVENTORY_REPOSITORY: unique symbol;
export interface InventoryRepository {
    listPlayerItems(playerId: string): Promise<PlayerInventoryItemSnapshot[]>;
    findPlayerItemById(playerId: string, inventoryItemId: string): Promise<PlayerInventoryItemSnapshot | null>;
    purchaseItem(command: PurchaseInventoryItemCommand): Promise<PurchaseInventoryItemResult | null>;
    equipItem(command: EquipInventoryItemCommand): Promise<PlayerInventoryItemSnapshot | null>;
    unequipSlot(playerId: string, slot: "weapon" | "armor"): Promise<PlayerInventoryItemSnapshot | null>;
}
