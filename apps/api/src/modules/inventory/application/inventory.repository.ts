import type {
  EquipInventoryItemCommand,
  PlayerInventoryItemSnapshot,
  PurchaseInventoryItemCommand,
  PurchaseEquipmentItemResult
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
  ): Promise<PurchaseEquipmentItemResult | null>;
  equipItem(command: EquipInventoryItemCommand): Promise<PlayerInventoryItemSnapshot | null>;
  unequipSlot(
    playerId: string,
    slot: "weapon" | "armor"
  ): Promise<PlayerInventoryItemSnapshot | null>;
}
