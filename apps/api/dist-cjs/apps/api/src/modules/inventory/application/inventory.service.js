"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const player_service_1 = require("../../player/application/player.service");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const inventory_catalog_1 = require("../domain/inventory.catalog");
const inventory_errors_1 = require("../domain/inventory.errors");
const inventory_policy_1 = require("../domain/inventory.policy");
const inventory_repository_1 = require("./inventory.repository");
let InventoryService = class InventoryService {
    playerService;
    domainEventsService;
    inventoryRepository;
    constructor(playerService, domainEventsService, inventoryRepository) {
        this.playerService = playerService;
        this.domainEventsService = domainEventsService;
        this.inventoryRepository = inventoryRepository;
    }
    listShopItems() {
        return inventory_catalog_1.starterShopItemCatalog.map((item) => (0, inventory_policy_1.toShopCatalogItem)(item, this.getUnlockRankName(item.unlockLevel)));
    }
    async listShopItemsForPlayer(playerId) {
        const progression = await this.playerService.getPlayerProgression(playerId);
        return inventory_catalog_1.starterShopItemCatalog.map((item) => (0, inventory_policy_1.toPlayerShopItem)(item, this.getUnlockRankName(item.unlockLevel), progression.level));
    }
    async listPlayerInventory(playerId) {
        await this.playerService.getPlayerById(playerId);
        const ownedItems = await this.inventoryRepository.listPlayerItems(playerId);
        return (0, inventory_policy_1.buildInventoryList)(ownedItems);
    }
    async getEquippedItems(playerId) {
        const inventory = await this.listPlayerInventory(playerId);
        return (0, inventory_policy_1.buildEquippedInventory)(inventory);
    }
    async getCombatLoadout(playerId) {
        const equippedItems = await this.getEquippedItems(playerId);
        return {
            weapon: equippedItems.weapon
                ? {
                    inventoryItemId: equippedItems.weapon.id,
                    itemId: equippedItems.weapon.itemId,
                    attackBonus: (0, inventory_catalog_1.getEquipmentItemById)(equippedItems.weapon.itemId)?.weaponStats?.damageBonus ?? 0
                }
                : null,
            armor: equippedItems.armor
                ? {
                    inventoryItemId: equippedItems.armor.id,
                    itemId: equippedItems.armor.itemId,
                    defenseBonus: (0, inventory_catalog_1.getEquipmentItemById)(equippedItems.armor.itemId)?.armorStats?.damageReduction ?? 0
                }
                : null
        };
    }
    async purchaseItem(playerId, itemId) {
        const item = (0, inventory_catalog_1.getShopItemById)(itemId);
        if (!item) {
            throw new common_1.NotFoundException(new inventory_errors_1.InventoryItemNotFoundError(itemId).message);
        }
        const progression = await this.playerService.getPlayerProgression(playerId);
        if (progression.level < item.unlockLevel) {
            throw new common_1.BadRequestException(new inventory_errors_1.InventoryItemLevelLockedError(item.name, item.unlockLevel, this.getUnlockRankName(item.unlockLevel)).message);
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
                throw new common_1.NotFoundException();
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
        }
        catch (error) {
            if (error instanceof inventory_errors_1.InsufficientCashForItemError) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async equipItem(playerId, inventoryItemId, slot) {
        await this.playerService.getPlayerById(playerId);
        const parsedSlot = this.parseSlotOrThrow(slot);
        const ownedItem = await this.inventoryRepository.findPlayerItemById(playerId, inventoryItemId);
        if (!ownedItem) {
            throw new common_1.NotFoundException(new inventory_errors_1.InventoryOwnedItemNotFoundError(inventoryItemId).message);
        }
        const item = (0, inventory_catalog_1.getEquipmentItemById)(ownedItem.itemId);
        if (!item) {
            throw new common_1.NotFoundException(new inventory_errors_1.InventoryItemNotFoundError(ownedItem.itemId).message);
        }
        if (ownedItem.marketListingId) {
            throw new common_1.BadRequestException(new inventory_errors_1.InventoryItemListedForSaleError(inventoryItemId).message);
        }
        const progression = await this.playerService.getPlayerProgression(playerId);
        if (progression.level < item.unlockLevel) {
            throw new common_1.BadRequestException(new inventory_errors_1.InventoryItemEquipLevelLockedError(item.name, item.unlockLevel, this.getUnlockRankName(item.unlockLevel)).message);
        }
        try {
            (0, inventory_policy_1.validateEquipmentSlotCompatibility)(item, parsedSlot);
        }
        catch {
            throw new common_1.BadRequestException(new inventory_errors_1.InvalidEquipmentSlotError(item.id, parsedSlot, item.equipSlot).message);
        }
        const equippedItem = await this.inventoryRepository.equipItem({
            playerId,
            inventoryItemId,
            slot: parsedSlot
        });
        if (!equippedItem) {
            throw new common_1.NotFoundException(new inventory_errors_1.InventoryOwnedItemNotFoundError(inventoryItemId).message);
        }
        return (0, inventory_policy_1.buildInventoryList)([equippedItem])[0];
    }
    async unequipSlot(playerId, slot) {
        await this.playerService.getPlayerById(playerId);
        const parsedSlot = this.parseSlotOrThrow(slot);
        const unequippedItem = await this.inventoryRepository.unequipSlot(playerId, parsedSlot);
        if (!unequippedItem) {
            return null;
        }
        return (0, inventory_policy_1.buildInventoryList)([unequippedItem])[0] ?? null;
    }
    async purchaseConsumable(playerId, itemId) {
        const item = (0, inventory_catalog_1.getConsumableItemById)(itemId);
        if (!item) {
            throw new common_1.NotFoundException(new inventory_errors_1.InventoryItemNotFoundError(itemId).message);
        }
        const player = await this.playerService.getPlayerById(playerId);
        if (player.cash < item.price) {
            throw new common_1.BadRequestException(new inventory_errors_1.InsufficientCashForItemError(item.id).message);
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
            consumedItem: (0, inventory_policy_1.toShopCatalogItem)(item, this.getUnlockRankName(item.unlockLevel))
        };
    }
    toConsumableResourceDelta(effects) {
        return effects.reduce((total, effect) => {
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
        }, {
            energy: 0,
            health: 0
        });
    }
    parseSlotOrThrow(slot) {
        try {
            return (0, inventory_policy_1.parseEquipmentSlot)(slot);
        }
        catch {
            throw new common_1.BadRequestException(new inventory_errors_1.UnknownEquipmentSlotError(slot).message);
        }
    }
    getUnlockRankName(unlockLevel) {
        return this.playerService.getRankNameForLevel(unlockLevel) ?? `Level ${unlockLevel}`;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(player_service_1.PlayerService)),
    __param(1, (0, common_1.Inject)(domain_events_service_1.DomainEventsService)),
    __param(2, (0, common_1.Inject)(inventory_repository_1.INVENTORY_REPOSITORY)),
    __metadata("design:paramtypes", [player_service_1.PlayerService,
        domain_events_service_1.DomainEventsService, Object])
], InventoryService);
