import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
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
  buildInventoryList,
  buildEquippedInventory,
  parseEquipmentSlot,
  toPlayerShopItem,
  toShopCatalogItem,
  validateEquipmentSlotCompatibility
} from "../domain/inventory.policy";
import type {
  ConsumableEffect,
  ConsumableItemDefinition,
  EquipmentSlot,
  EquippedInventory,
  InventoryCombatLoadout,
  InventoryListItem,
  PlayerAssetBonuses,
  PlayerShopItem,
  PurchaseShopItemResult,
  ShopCatalogItem
} from "../domain/inventory.types";
import {
  INVENTORY_REPOSITORY,
  type InventoryRepository
} from "./inventory.repository";
import { derivePlayerProgression } from "../../player/domain/player.policy";
import { InventoryBalanceService } from "./inventory-balance.service";

@Injectable()
export class InventoryService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(InventoryBalanceService)
    private readonly inventoryBalanceService: InventoryBalanceService,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: InventoryRepository
  ) {}

  listShopItems(): ShopCatalogItem[] {
    return this.inventoryBalanceService.listShopItemBalances().map((item) =>
      toShopCatalogItem(item, this.getUnlockRankName(item.unlockLevel))
    );
  }

  async listShopItemsForPlayer(playerId: string): Promise<PlayerShopItem[]> {
    const progression = await this.getEffectivePlayerProgression(playerId);

    return this.inventoryBalanceService.listShopItemBalances().map((item) =>
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
    return buildInventoryList(ownedItems, (itemId) => this.resolveOwnedShopItem(itemId));
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
              this.inventoryBalanceService.findEquipmentItemById(
                equippedItems.weapon.itemId,
                { includeArchived: true }
              )?.weaponStats?.damageBonus ?? 0
          }
        : null,
      armor: equippedItems.armor
        ? {
            inventoryItemId: equippedItems.armor.id,
            itemId: equippedItems.armor.itemId,
            defenseBonus:
              this.inventoryBalanceService.findEquipmentItemById(
                equippedItems.armor.itemId,
                { includeArchived: true }
              )?.armorStats?.damageReduction ?? 0
          }
        : null
    };
  }

  async purchaseItem(
    playerId: string,
    itemId: string
  ): Promise<PurchaseShopItemResult> {
    const item = this.inventoryBalanceService.findShopItemById(itemId);

    if (!item) {
      throw new NotFoundException(new InventoryItemNotFoundError(itemId).message);
    }

    const progression = await this.getEffectivePlayerProgression(playerId);

    if (progression.level < item.unlockLevel) {
      throw new BadRequestException(
        new InventoryItemLevelLockedError(
          item.name,
          item.unlockLevel,
          this.getUnlockRankName(item.unlockLevel)
        ).message
      );
    }

    if (item.type === "vehicle") {
      const bonuses = await this.getPlayerAssetBonuses(playerId);

      if (bonuses.ownedVehicleCount >= bonuses.parkingSlots) {
        throw new BadRequestException(
          `You need more parking space before buying "${item.name}".`
        );
      }
    }

    if (item.delivery === "instant") {
      return this.purchaseConsumable(playerId, item);
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

    const item = this.inventoryBalanceService.findEquipmentItemById(ownedItem.itemId, {
      includeArchived: true
    });

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

    const progression = await this.getEffectivePlayerProgression(playerId);

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

    return buildInventoryList([equippedItem], (itemId) => this.resolveOwnedShopItem(itemId))[0]!;
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

    return (
      buildInventoryList([unequippedItem], (itemId) => this.resolveOwnedShopItem(itemId))[0] ??
      null
    );
  }

  async getPlayerAssetBonuses(playerId: string): Promise<PlayerAssetBonuses> {
    const inventory = await this.listPlayerInventory(playerId);
    const respectBonus = inventory.reduce(
      (total, item) => total + (item.respectBonus ?? 0),
      0
    );
    const parkingSlots = inventory.reduce(
      (total, item) => total + (item.parkingSlots ?? 0),
      0
    );
    const ownedVehicleCount = inventory.filter((item) => item.type === "vehicle").length;

    return {
      respectBonus,
      parkingSlots,
      ownedVehicleCount,
      availableVehicleSlots: Math.max(0, parkingSlots - ownedVehicleCount)
    };
  }

  private async getEffectivePlayerProgression(playerId: string) {
    const player = await this.playerService.getPlayerById(playerId);

    if (!player) {
      return this.playerService.getPlayerProgression(playerId);
    }

    const bonuses = await this.getPlayerAssetBonuses(playerId);
    return derivePlayerProgression(player.respect + bonuses.respectBonus);
  }

  private async purchaseConsumable(
    playerId: string,
    item: ConsumableItemDefinition
  ): Promise<PurchaseShopItemResult> {
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

  private resolveOwnedShopItem(itemId: string) {
    const item = this.inventoryBalanceService.findShopItemById(itemId, {
      includeArchived: true
    });

    return item?.delivery === "inventory" ? item : undefined;
  }
}
