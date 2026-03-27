import { PrismaService } from "../../../platform/database/prisma.service";
import type { EquipInventoryItemCommand, PlayerInventoryItemSnapshot, PurchaseInventoryItemCommand, PurchaseInventoryItemResult } from "../domain/inventory.types";
import type { InventoryRepository } from "../application/inventory.repository";
export declare class PrismaInventoryRepository implements InventoryRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    listPlayerItems(playerId: string): Promise<PlayerInventoryItemSnapshot[]>;
    findPlayerItemById(playerId: string, inventoryItemId: string): Promise<PlayerInventoryItemSnapshot | null>;
    purchaseItem(command: PurchaseInventoryItemCommand): Promise<PurchaseInventoryItemResult | null>;
    equipItem(command: EquipInventoryItemCommand): Promise<PlayerInventoryItemSnapshot | null>;
    unequipSlot(playerId: string, slot: "weapon" | "armor"): Promise<PlayerInventoryItemSnapshot | null>;
}
