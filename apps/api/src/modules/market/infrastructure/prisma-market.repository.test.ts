import { describe, expect, it, vi } from "vitest";

import { PrismaMarketRepository } from "./prisma-market.repository";

describe("PrismaMarketRepository", () => {
  it("creates a listing and locks the inventory item", async () => {
    const transaction = {
      playerInventoryItem: {
        findUnique: vi.fn().mockResolvedValue({
          id: "owned-1",
          playerId: "seller-1",
          itemId: "rusty-knife",
          equippedSlot: null,
          marketListingId: null
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 })
      },
      marketListing: {
        create: vi.fn().mockResolvedValue({
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
    const repository = new PrismaMarketRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.createListing({
      playerId: "seller-1",
      inventoryItemId: "owned-1",
      price: 900
    });

    expect(result.status).toBe("created");
    expect(transaction.playerInventoryItem.updateMany).toHaveBeenCalledWith({
      where: {
        id: "owned-1",
        playerId: "seller-1",
        marketListingId: null,
        equippedSlot: null
      },
      data: {
        marketListingId: expect.any(String)
      }
    });
  });

  it("marks a listing sold and transfers ownership", async () => {
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
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({ id: "seller-1", cash: 2500 })
          .mockResolvedValueOnce({ id: "buyer-1", cash: 2500 })
          .mockResolvedValueOnce({ id: "buyer-1", cash: 1600 }),
        update: vi.fn().mockResolvedValue({ id: "seller-1", cash: 3400 }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 })
      },
      playerInventoryItem: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 })
      },
      marketListing: {
        findUnique: vi.fn().mockResolvedValue(listing),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn().mockResolvedValue({
          ...listing,
          buyerPlayerId: "buyer-1",
          status: "sold",
          soldAt: new Date("2026-03-17T10:05:00.000Z")
        })
      }
    };
    const repository = new PrismaMarketRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.buyListing({
      listingId: "listing-1",
      buyerPlayerId: "buyer-1"
    });

    expect(result.status).toBe("purchased");
    expect(transaction.player.updateMany).toHaveBeenCalledWith({
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
    expect(transaction.playerInventoryItem.updateMany).toHaveBeenCalledWith({
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
