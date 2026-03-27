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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../auth/api/auth.guard");
const current_actor_decorator_1 = require("../../auth/api/current-actor.decorator");
const current_player_utils_1 = require("../../auth/api/current-player.utils");
const inventory_service_1 = require("../application/inventory.service");
const inventory_presenter_1 = require("./inventory.presenter");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    getShopItems() {
        return this.inventoryService.listShopItems().map(inventory_presenter_1.toShopItemResponseBody);
    }
    async getCurrentPlayerShopItems(actor) {
        const items = await this.inventoryService.listShopItemsForPlayer((0, current_player_utils_1.requireCurrentPlayerId)(actor));
        return items.map(inventory_presenter_1.toPlayerShopItemResponseBody);
    }
    async getPlayerInventory(playerId) {
        const inventory = await this.inventoryService.listPlayerInventory(playerId);
        return inventory.map(inventory_presenter_1.toPlayerInventoryItemResponseBody);
    }
    async getEquippedItems(playerId) {
        const equippedItems = await this.inventoryService.getEquippedItems(playerId);
        return (0, inventory_presenter_1.toEquippedItemsResponseBody)(equippedItems);
    }
    async getCurrentPlayerInventory(actor) {
        const inventory = await this.inventoryService.listPlayerInventory((0, current_player_utils_1.requireCurrentPlayerId)(actor));
        return inventory.map(inventory_presenter_1.toPlayerInventoryItemResponseBody);
    }
    async getCurrentEquippedItems(actor) {
        const equippedItems = await this.inventoryService.getEquippedItems((0, current_player_utils_1.requireCurrentPlayerId)(actor));
        return (0, inventory_presenter_1.toEquippedItemsResponseBody)(equippedItems);
    }
    async purchaseItem(playerId, itemId) {
        const result = await this.inventoryService.purchaseItem(playerId, itemId);
        return (0, inventory_presenter_1.toPurchaseItemResponseBody)(result);
    }
    async purchaseCurrentPlayerItem(itemId, actor) {
        const result = await this.inventoryService.purchaseItem((0, current_player_utils_1.requireCurrentPlayerId)(actor), itemId);
        return (0, inventory_presenter_1.toPurchaseItemResponseBody)(result);
    }
    async equipItem(playerId, inventoryItemId, slot) {
        const result = await this.inventoryService.equipItem(playerId, inventoryItemId, slot);
        return (0, inventory_presenter_1.toPlayerInventoryItemResponseBody)(result);
    }
    async equipCurrentPlayerItem(inventoryItemId, slot, actor) {
        const result = await this.inventoryService.equipItem((0, current_player_utils_1.requireCurrentPlayerId)(actor), inventoryItemId, slot);
        return (0, inventory_presenter_1.toPlayerInventoryItemResponseBody)(result);
    }
    async unequipSlot(playerId, slot) {
        const result = await this.inventoryService.unequipSlot(playerId, slot);
        return result ? (0, inventory_presenter_1.toPlayerInventoryItemResponseBody)(result) : null;
    }
    async unequipCurrentPlayerSlot(slot, actor) {
        const result = await this.inventoryService.unequipSlot((0, current_player_utils_1.requireCurrentPlayerId)(actor), slot);
        return result ? (0, inventory_presenter_1.toPlayerInventoryItemResponseBody)(result) : null;
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)("shop/items"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], InventoryController.prototype, "getShopItems", null);
__decorate([
    (0, common_1.Get)("me/shop/items"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getCurrentPlayerShopItems", null);
__decorate([
    (0, common_1.Get)("players/:playerId/inventory"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getPlayerInventory", null);
__decorate([
    (0, common_1.Get)("players/:playerId/equipment"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getEquippedItems", null);
__decorate([
    (0, common_1.Get)("me/inventory"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getCurrentPlayerInventory", null);
__decorate([
    (0, common_1.Get)("me/equipment"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getCurrentEquippedItems", null);
__decorate([
    (0, common_1.Post)("players/:playerId/shop/:itemId/purchase"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("itemId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "purchaseItem", null);
__decorate([
    (0, common_1.Post)("me/shop/:itemId/purchase"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("itemId")),
    __param(1, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "purchaseCurrentPlayerItem", null);
__decorate([
    (0, common_1.Post)("players/:playerId/inventory/:inventoryItemId/equip/:slot"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("inventoryItemId", common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)("slot")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "equipItem", null);
__decorate([
    (0, common_1.Post)("me/inventory/:inventoryItemId/equip/:slot"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("inventoryItemId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("slot")),
    __param(2, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "equipCurrentPlayerItem", null);
__decorate([
    (0, common_1.Post)("players/:playerId/equipment/:slot/unequip"),
    __param(0, (0, common_1.Param)("playerId", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("slot")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "unequipSlot", null);
__decorate([
    (0, common_1.Post)("me/equipment/:slot/unequip"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("slot")),
    __param(1, (0, current_actor_decorator_1.CurrentActor)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "unequipCurrentPlayerSlot", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_1.Inject)(inventory_service_1.InventoryService)),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
