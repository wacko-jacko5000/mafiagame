"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const inventory_errors_1 = require("../domain/inventory.errors");
const prisma_inventory_repository_1 = require("./prisma-inventory.repository");
(0, vitest_1.describe)("PrismaInventoryRepository", () => {
    (0, vitest_1.it)("lists owned items for a player", async () => {
        const now = new Date();
        const repository = new prisma_inventory_repository_1.PrismaInventoryRepository({
            playerInventoryItem: {
                findMany: vitest_1.vi.fn().mockResolvedValue([
                    {
                        id: "owned-1",
                        playerId: "player-1",
                        itemId: "rusty-knife",
                        equippedSlot: null,
                        marketListingId: null,
                        acquiredAt: now,
                        createdAt: now,
                        updatedAt: now
                    }
                ])
            }
        });
        const result = await repository.listPlayerItems("player-1");
        (0, vitest_1.expect)(result).toEqual([
            {
                id: "owned-1",
                playerId: "player-1",
                itemId: "rusty-knife",
                equippedSlot: null,
                marketListingId: null,
                acquiredAt: now,
                createdAt: now,
                updatedAt: now
            }
        ]);
    });
    (0, vitest_1.it)("purchases an item in one transaction", async () => {
        const now = new Date("2026-03-16T20:00:00.000Z");
        const transaction = {
            player: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "player-1",
                    cash: 2500
                }),
                update: vitest_1.vi.fn().mockResolvedValue({
                    id: "player-1",
                    cash: 2100
                })
            },
            playerInventoryItem: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    id: "owned-1",
                    playerId: "player-1",
                    itemId: "rusty-knife",
                    equippedSlot: null,
                    marketListingId: null,
                    acquiredAt: now,
                    createdAt: now,
                    updatedAt: now
                })
            }
        };
        const repository = new prisma_inventory_repository_1.PrismaInventoryRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.purchaseItem({
            playerId: "player-1",
            item: {
                id: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                category: "handguns",
                price: 400,
                equipSlot: "weapon",
                unlockLevel: 1,
                weaponStats: { damageBonus: 4 },
                armorStats: null
            }
        });
        (0, vitest_1.expect)(result).toEqual({
            playerCashAfterPurchase: 2100,
            ownedItem: {
                id: "owned-1",
                playerId: "player-1",
                itemId: "rusty-knife",
                name: "Glock 17",
                type: "weapon",
                category: "handguns",
                price: 400,
                equipSlot: "weapon",
                unlockLevel: 1,
                equippedSlot: null,
                marketListingId: null,
                weaponStats: {
                    damageBonus: 4
                },
                armorStats: null,
                acquiredAt: now
            }
        });
    });
    (0, vitest_1.it)("rejects purchases that would make player cash negative", async () => {
        const transaction = {
            player: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "player-1",
                    cash: 100
                }),
                update: vitest_1.vi.fn()
            },
            playerInventoryItem: {
                create: vitest_1.vi.fn()
            }
        };
        const repository = new prisma_inventory_repository_1.PrismaInventoryRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        await (0, vitest_1.expect)(repository.purchaseItem({
            playerId: "player-1",
            item: {
                id: "cheap-pistol",
                name: "Colt M1911",
                type: "weapon",
                category: "handguns",
                price: 1800,
                equipSlot: "weapon",
                unlockLevel: 1,
                weaponStats: { damageBonus: 8 },
                armorStats: null
            }
        })).rejects.toBeInstanceOf(inventory_errors_1.InsufficientCashForItemError);
    });
    (0, vitest_1.it)("equips an owned item and clears the slot from any previous item", async () => {
        const now = new Date("2026-03-16T20:00:00.000Z");
        const transaction = {
            playerInventoryItem: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "owned-2",
                    playerId: "player-1",
                    itemId: "cheap-pistol",
                    equippedSlot: null,
                    marketListingId: null,
                    acquiredAt: now,
                    createdAt: now,
                    updatedAt: now
                }),
                updateMany: vitest_1.vi.fn().mockResolvedValue({ count: 1 }),
                update: vitest_1.vi.fn().mockResolvedValue({
                    id: "owned-2",
                    playerId: "player-1",
                    itemId: "cheap-pistol",
                    equippedSlot: "weapon",
                    marketListingId: null,
                    acquiredAt: now,
                    createdAt: now,
                    updatedAt: now
                })
            }
        };
        const repository = new prisma_inventory_repository_1.PrismaInventoryRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.equipItem({
            playerId: "player-1",
            inventoryItemId: "owned-2",
            slot: "weapon"
        });
        (0, vitest_1.expect)(result?.equippedSlot).toBe("weapon");
    });
    (0, vitest_1.it)("unequips the currently equipped slot item", async () => {
        const now = new Date("2026-03-16T20:00:00.000Z");
        const transaction = {
            playerInventoryItem: {
                findMany: vitest_1.vi.fn().mockResolvedValue([
                    {
                        id: "owned-1",
                        playerId: "player-1",
                        itemId: "rusty-knife",
                        equippedSlot: "weapon",
                        marketListingId: null,
                        acquiredAt: now,
                        createdAt: now,
                        updatedAt: now
                    }
                ]),
                update: vitest_1.vi.fn().mockResolvedValue({
                    id: "owned-1",
                    playerId: "player-1",
                    itemId: "rusty-knife",
                    equippedSlot: null,
                    marketListingId: null,
                    acquiredAt: now,
                    createdAt: now,
                    updatedAt: now
                })
            }
        };
        const repository = new prisma_inventory_repository_1.PrismaInventoryRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.unequipSlot("player-1", "weapon");
        (0, vitest_1.expect)(result?.equippedSlot).toBeNull();
    });
});
