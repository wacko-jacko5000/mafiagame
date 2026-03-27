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
exports.PrismaInventoryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../platform/database/prisma.service");
const inventory_errors_1 = require("../domain/inventory.errors");
const inventory_policy_1 = require("../domain/inventory.policy");
function toPlayerInventoryItemSnapshot(ownedItem) {
    return {
        id: ownedItem.id,
        playerId: ownedItem.playerId,
        itemId: ownedItem.itemId,
        equippedSlot: ownedItem.equippedSlot,
        marketListingId: ownedItem.marketListingId,
        acquiredAt: ownedItem.acquiredAt,
        createdAt: ownedItem.createdAt,
        updatedAt: ownedItem.updatedAt
    };
}
let PrismaInventoryRepository = class PrismaInventoryRepository {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async listPlayerItems(playerId) {
        const prismaClient = this.prismaService;
        const ownedItems = await prismaClient.playerInventoryItem.findMany({
            where: {
                playerId
            },
            orderBy: {
                acquiredAt: "asc"
            }
        });
        return ownedItems.map(toPlayerInventoryItemSnapshot);
    }
    async findPlayerItemById(playerId, inventoryItemId) {
        const prismaClient = this.prismaService;
        const ownedItem = await prismaClient.playerInventoryItem.findUnique({
            where: {
                id: inventoryItemId
            }
        });
        if (!ownedItem || ownedItem.playerId !== playerId) {
            return null;
        }
        return toPlayerInventoryItemSnapshot(ownedItem);
    }
    async purchaseItem(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const player = await tx.player.findUnique({
                where: {
                    id: command.playerId
                }
            });
            if (!player) {
                return null;
            }
            if (player.cash < command.item.price) {
                throw new inventory_errors_1.InsufficientCashForItemError(command.item.id);
            }
            const updatedPlayer = await tx.player.update({
                where: {
                    id: command.playerId
                },
                data: {
                    cash: player.cash - command.item.price
                }
            });
            const ownedItem = await tx.playerInventoryItem.create({
                data: {
                    playerId: command.playerId,
                    itemId: command.item.id
                }
            });
            return {
                delivery: "inventory",
                playerCashAfterPurchase: updatedPlayer.cash,
                playerEnergyAfterPurchase: null,
                playerHealthAfterPurchase: null,
                ownedItem: (0, inventory_policy_1.toInventoryListItem)(toPlayerInventoryItemSnapshot(ownedItem), command.item),
                consumedItem: null
            };
        });
    }
    async equipItem(command) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const ownedItem = await tx.playerInventoryItem.findUnique({
                where: {
                    id: command.inventoryItemId
                }
            });
            if (!ownedItem || ownedItem.playerId !== command.playerId) {
                return null;
            }
            await tx.playerInventoryItem.updateMany({
                where: {
                    playerId: command.playerId,
                    equippedSlot: command.slot
                },
                data: {
                    equippedSlot: null
                }
            });
            const equippedItem = await tx.playerInventoryItem.update({
                where: {
                    id: command.inventoryItemId
                },
                data: {
                    equippedSlot: command.slot
                }
            });
            return toPlayerInventoryItemSnapshot(equippedItem);
        });
    }
    async unequipSlot(playerId, slot) {
        const prismaClient = this.prismaService;
        return prismaClient.$transaction(async (tx) => {
            const equippedItem = await tx.playerInventoryItem.findMany({
                where: {
                    playerId
                },
                orderBy: {
                    acquiredAt: "asc"
                }
            });
            const matchingItem = equippedItem.find((item) => item.equippedSlot === slot);
            if (!matchingItem) {
                return null;
            }
            const updatedItem = await tx.playerInventoryItem.update({
                where: {
                    id: matchingItem.id
                },
                data: {
                    equippedSlot: null
                }
            });
            return toPlayerInventoryItemSnapshot(updatedItem);
        });
    }
};
exports.PrismaInventoryRepository = PrismaInventoryRepository;
exports.PrismaInventoryRepository = PrismaInventoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaInventoryRepository);
