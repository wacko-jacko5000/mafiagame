"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_market_repository_1 = require("./prisma-market.repository");
(0, vitest_1.describe)("PrismaMarketRepository", () => {
    (0, vitest_1.it)("creates a listing and locks the inventory item", async () => {
        const transaction = {
            playerInventoryItem: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "owned-1",
                    playerId: "seller-1",
                    itemId: "rusty-knife",
                    equippedSlot: null,
                    marketListingId: null
                }),
                updateMany: vitest_1.vi.fn().mockResolvedValue({ count: 1 })
            },
            marketListing: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    id: "listing-1",
                    inventoryItemId: "owned-1",
                    sellerPlayerId: "seller-1",
                    buyerPlayerId: null,
                    price: 900,
                    status: "active",
                    createdAt: new Date("2026-03-17T10:00:00.000Z"),
                    soldAt: null,
                    inventoryItem: {
                        id: "owned-1",
                        playerId: "seller-1",
                        itemId: "rusty-knife",
                        equippedSlot: null,
                        marketListingId: null
                    }
                })
            }
        };
        const repository = new prisma_market_repository_1.PrismaMarketRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.createListing({
            playerId: "seller-1",
            inventoryItemId: "owned-1",
            price: 900
        });
        (0, vitest_1.expect)(result.status).toBe("created");
        (0, vitest_1.expect)(transaction.playerInventoryItem.updateMany).toHaveBeenCalledWith({
            where: {
                id: "owned-1",
                playerId: "seller-1",
                marketListingId: null,
                equippedSlot: null
            },
            data: {
                marketListingId: vitest_1.expect.any(String)
            }
        });
    });
    (0, vitest_1.it)("marks a listing sold and transfers ownership", async () => {
        const listing = {
            id: "listing-1",
            inventoryItemId: "owned-1",
            sellerPlayerId: "seller-1",
            buyerPlayerId: null,
            price: 900,
            status: "active",
            createdAt: new Date("2026-03-17T10:00:00.000Z"),
            soldAt: null,
            inventoryItem: {
                id: "owned-1",
                playerId: "seller-1",
                itemId: "rusty-knife",
                equippedSlot: null,
                marketListingId: "listing-1"
            }
        };
        const transaction = {
            player: {
                findUnique: vitest_1.vi
                    .fn()
                    .mockResolvedValueOnce({ id: "seller-1", cash: 2500 })
                    .mockResolvedValueOnce({ id: "buyer-1", cash: 2500 })
                    .mockResolvedValueOnce({ id: "buyer-1", cash: 1600 }),
                update: vitest_1.vi.fn().mockResolvedValue({ id: "seller-1", cash: 3400 }),
                updateMany: vitest_1.vi.fn().mockResolvedValue({ count: 1 })
            },
            playerInventoryItem: {
                updateMany: vitest_1.vi.fn().mockResolvedValue({ count: 1 })
            },
            marketListing: {
                findUnique: vitest_1.vi.fn().mockResolvedValue(listing),
                updateMany: vitest_1.vi.fn().mockResolvedValue({ count: 1 }),
                update: vitest_1.vi.fn().mockResolvedValue({
                    ...listing,
                    buyerPlayerId: "buyer-1",
                    status: "sold",
                    soldAt: new Date("2026-03-17T10:05:00.000Z")
                })
            }
        };
        const repository = new prisma_market_repository_1.PrismaMarketRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.buyListing({
            listingId: "listing-1",
            buyerPlayerId: "buyer-1"
        });
        (0, vitest_1.expect)(result.status).toBe("purchased");
        (0, vitest_1.expect)(transaction.player.updateMany).toHaveBeenCalledWith({
            where: {
                id: "buyer-1",
                cash: {
                    gte: 900
                }
            },
            data: {
                cash: {
                    decrement: 900
                }
            }
        });
        (0, vitest_1.expect)(transaction.playerInventoryItem.updateMany).toHaveBeenCalledWith({
            where: {
                id: "owned-1",
                playerId: "seller-1",
                marketListingId: "listing-1"
            },
            data: {
                playerId: "buyer-1",
                equippedSlot: null,
                marketListingId: null
            }
        });
    });
});
