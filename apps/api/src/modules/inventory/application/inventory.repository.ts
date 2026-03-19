import type {
  EquipInventoryItemCommand,
  EquippedInventory,
  PlayerInventoryItemSnapshot,
  PurchaseInventoryItemCommand,
  PurchaseInventoryItemResult
} from "../domain/inventory.types";

export const INVENTORY_REPOSITORY = Symbol("INVENTORY_REPOSITORY");

export interface InventoryRepository {
  listPlayerItems(playerId: string): Promise<PlayerInventoryItemSnapshot[]>;
  findPlayerItemById(
    playerId: string,
    inventoryItemId: string
  ): Promise<PlayerInventoryItemSnapshot | null>;
  purchaseItem(
    command: PurchaseInventoryItemCommand
  ): Promise<PurchaseInventoryItemResult | null>;
  equipItem(command: EquipInventoryItemCommand): Promise<PlayerInventoryItemSnapshot | null>;
  unequipSlot(
    playerId: string,
    slot: "weapon" | "armor"
  ): Promise<PlayerInventoryItemSnapshot | null>;
}
