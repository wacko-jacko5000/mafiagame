import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import {
  getConsumableItemById,
  getEquipmentItemById,
  getShopItemById,
  starterShopItemCatalog
} from "../domain/inventory.catalog";
import {
  InvalidEquipmentSlotError,
  InsufficientCashForItemError,
  InventoryItemEquipLevelLockedError,
  InventoryItemLevelLockedError,
  InventoryItemListedForSaleError,
  InventoryOwnedItemNotFoundError,
  InventoryItemNotFoundError,
  UnknownEquipmentSlotError
} from "../domain/inventory.errors";
import {
  buildEquippedInventory,
  buildInventoryList,
  parseEquipmentSlot,
  toPlayerShopItem,
  toShopCatalogItem,
  validateEquipmentSlotCompatibility
} from "../domain/inventory.policy";
import type {
  ConsumableEffect,
  EquipmentSlot,
  EquippedInventory,
  InventoryCombatLoadout,
  InventoryListItem,
  PlayerShopItem,
  PurchaseShopItemResult,
  ShopCatalogItem
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

  listShopItems(): ShopCatalogItem[] {
    return starterShopItemCatalog.map((item) =>
      toShopCatalogItem(item, this.getUnlockRankName(item.unlockLevel))
    );
  }

  async listShopItemsForPlayer(playerId: string): Promise<PlayerShopItem[]> {
    const progression = await this.playerService.getPlayerProgression(playerId);

    return starterShopItemCatalog.map((item) =>
      toPlayerShopItem(
        item,
        this.getUnlockRankName(item.unlockLevel),
        progression.level
      )
    );
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
              getEquipmentItemById(equippedItems.weapon.itemId)?.weaponStats?.damageBonus ?? 0
          }
        : null,
      armor: equippedItems.armor
        ? {
            inventoryItemId: equippedItems.armor.id,
            itemId: equippedItems.armor.itemId,
            defenseBonus:
              getEquipmentItemById(equippedItems.armor.itemId)?.armorStats?.damageReduction ?? 0
          }
        : null
    };
  }

  async purchaseItem(
    playerId: string,
    itemId: string
  ): Promise<PurchaseShopItemResult> {
    const item = getShopItemById(itemId);

    if (!item) {
      throw new NotFoundException(new InventoryItemNotFoundError(itemId).message);
    }

    const progression = await this.playerService.getPlayerProgression(playerId);

    if (progression.level < item.unlockLevel) {
      throw new BadRequestException(
        new InventoryItemLevelLockedError(
          item.name,
          item.unlockLevel,
          this.getUnlockRankName(item.unlockLevel)
        ).message
      );
    }

    if (item.delivery === "instant") {
      return this.purchaseConsumable(playerId, item.id);
    }

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
      return {
        delivery: "inventory",
        playerCashAfterPurchase: purchaseResult.playerCashAfterPurchase,
        playerEnergyAfterPurchase: null,
        playerHealthAfterPurchase: null,
        ownedItem: purchaseResult.ownedItem,
        consumedItem: null
      };
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

    const item = getEquipmentItemById(ownedItem.itemId);

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

    const progression = await this.playerService.getPlayerProgression(playerId);

    if (progression.level < item.unlockLevel) {
      throw new BadRequestException(
        new InventoryItemEquipLevelLockedError(
          item.name,
          item.unlockLevel,
          this.getUnlockRankName(item.unlockLevel)
        ).message
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

  private async purchaseConsumable(
    playerId: string,
    itemId: string
  ): Promise<PurchaseShopItemResult> {
    const item = getConsumableItemById(itemId);

    if (!item) {
      throw new NotFoundException(new InventoryItemNotFoundError(itemId).message);
    }

    const player = await this.playerService.getPlayerById(playerId);

    if (player.cash < item.price) {
      throw new BadRequestException(new InsufficientCashForItemError(item.id).message);
    }

    const delta = this.toConsumableResourceDelta(item.consumableEffects);
    const updatedPlayer = await this.playerService.applyResourceDelta(playerId, {
      cash: -item.price,
      energy: delta.energy,
      health: delta.health
    });

    return {
      delivery: "instant",
      playerCashAfterPurchase: updatedPlayer.cash,
      playerEnergyAfterPurchase: updatedPlayer.energy,
      playerHealthAfterPurchase: updatedPlayer.health,
      ownedItem: null,
      consumedItem: toShopCatalogItem(item, this.getUnlockRankName(item.unlockLevel))
    };
  }

  private toConsumableResourceDelta(
    effects: readonly ConsumableEffect[]
  ): { energy: number; health: number } {
    return effects.reduce(
      (total, effect) => {
        if (effect.type !== "resource") {
          return total;
        }

        if (effect.resource === "energy") {
          return {
            ...total,
            energy: total.energy + effect.amount
          };
        }

        return {
          ...total,
          health: total.health + effect.amount
        };
      },
      {
        energy: 0,
        health: 0
      }
    );
  }

  private parseSlotOrThrow(slot: string): EquipmentSlot {
    try {
      return parseEquipmentSlot(slot);
    } catch {
      throw new BadRequestException(new UnknownEquipmentSlotError(slot).message);
    }
  }

  private getUnlockRankName(unlockLevel: number): string {
    return this.playerService.getRankNameForLevel(unlockLevel) ?? `Level ${unlockLevel}`;
  }
}
