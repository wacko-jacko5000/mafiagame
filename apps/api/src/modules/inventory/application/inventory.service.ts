import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import {
  getItemById,
  starterItemCatalog
} from "../domain/inventory.catalog";
import {
  InvalidEquipmentSlotError,
  InsufficientCashForItemError,
  InventoryItemListedForSaleError,
  InventoryOwnedItemNotFoundError,
  InventoryItemNotFoundError,
  UnknownEquipmentSlotError
} from "../domain/inventory.errors";
import {
  buildEquippedInventory,
  buildInventoryList,
  parseEquipmentSlot,
  validateEquipmentSlotCompatibility
} from "../domain/inventory.policy";
import type {
  EquipmentSlot,
  EquippedInventory,
  InventoryCombatLoadout,
  InventoryListItem,
  ItemDefinition,
  PurchaseInventoryItemResult
} from "../domain/inventory.types";
import {
  INVENTORY_REPOSITORY,
  type InventoryRepository
} from "./inventory.repository";

@Injectable()
export class InventoryService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: InventoryRepository
  ) {}

  listShopItems(): readonly ItemDefinition[] {
    return starterItemCatalog;
  }

  async listPlayerInventory(playerId: string): Promise<InventoryListItem[]> {
    await this.playerService.getPlayerById(playerId);

    const ownedItems = await this.inventoryRepository.listPlayerItems(playerId);
    return buildInventoryList(ownedItems);
  }

  async getEquippedItems(playerId: string): Promise<EquippedInventory> {
    const inventory = await this.listPlayerInventory(playerId);
    return buildEquippedInventory(inventory);
  }

  async getCombatLoadout(playerId: string): Promise<InventoryCombatLoadout> {
    const equippedItems = await this.getEquippedItems(playerId);

    return {
      weapon: equippedItems.weapon
        ? {
            inventoryItemId: equippedItems.weapon.id,
            itemId: equippedItems.weapon.itemId,
            attackBonus:
              getItemById(equippedItems.weapon.itemId)?.combatAttackBonus ?? 0
          }
        : null,
      armor: equippedItems.armor
        ? {
            inventoryItemId: equippedItems.armor.id,
            itemId: equippedItems.armor.itemId,
            defenseBonus:
              getItemById(equippedItems.armor.itemId)?.combatDefenseBonus ?? 0
          }
        : null
    };
  }

  async purchaseItem(
    playerId: string,
    itemId: string
  ): Promise<PurchaseInventoryItemResult> {
    const item = getItemById(itemId);

    if (!item) {
      throw new NotFoundException(new InventoryItemNotFoundError(itemId).message);
    }

    await this.playerService.getPlayerById(playerId);

    try {
      const purchaseResult = await this.inventoryRepository.purchaseItem({
        playerId,
        item
      });

      if (!purchaseResult) {
        throw new NotFoundException();
      }

      await this.domainEventsService.publish({
        type: "inventory.item_purchased",
        occurredAt: new Date(),
        playerId,
        inventoryItemId: purchaseResult.ownedItem.id,
        itemId: purchaseResult.ownedItem.itemId,
        price: purchaseResult.ownedItem.price
      });
      return purchaseResult;
    } catch (error) {
      if (error instanceof InsufficientCashForItemError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async equipItem(
    playerId: string,
    inventoryItemId: string,
    slot: string
  ): Promise<InventoryListItem> {
    await this.playerService.getPlayerById(playerId);
    const parsedSlot = this.parseSlotOrThrow(slot);

    const ownedItem = await this.inventoryRepository.findPlayerItemById(
      playerId,
      inventoryItemId
    );

    if (!ownedItem) {
      throw new NotFoundException(
        new InventoryOwnedItemNotFoundError(inventoryItemId).message
      );
    }

    const item = getItemById(ownedItem.itemId);

    if (!item) {
      throw new NotFoundException(
        new InventoryItemNotFoundError(ownedItem.itemId).message
      );
    }

    if (ownedItem.marketListingId) {
      throw new BadRequestException(
        new InventoryItemListedForSaleError(inventoryItemId).message
      );
    }

    try {
      validateEquipmentSlotCompatibility(item, parsedSlot);
    } catch {
      throw new BadRequestException(
        new InvalidEquipmentSlotError(item.id, parsedSlot, item.equipSlot).message
      );
    }

    const equippedItem = await this.inventoryRepository.equipItem({
      playerId,
      inventoryItemId,
      slot: parsedSlot
    });

    if (!equippedItem) {
      throw new NotFoundException(
        new InventoryOwnedItemNotFoundError(inventoryItemId).message
      );
    }

    return buildInventoryList([equippedItem])[0]!;
  }

  async unequipSlot(
    playerId: string,
    slot: string
  ): Promise<InventoryListItem | null> {
    await this.playerService.getPlayerById(playerId);
    const parsedSlot = this.parseSlotOrThrow(slot);

    const unequippedItem = await this.inventoryRepository.unequipSlot(
      playerId,
      parsedSlot
    );

    if (!unequippedItem) {
      return null;
    }

    return buildInventoryList([unequippedItem])[0] ?? null;
  }

  private parseSlotOrThrow(slot: string): EquipmentSlot {
    try {
      return parseEquipmentSlot(slot);
    } catch {
      throw new BadRequestException(new UnknownEquipmentSlotError(slot).message);
    }
  }
}
