import { describe, expect, it, vi } from "vitest";
import { InsufficientCashForItemError } from "../domain/inventory.errors";

import { PrismaInventoryRepository } from "./prisma-inventory.repository";

describe("PrismaInventoryRepository", () => {
  it("lists owned items for a player", async () => {
    const now = new Date();
    const repository = new PrismaInventoryRepository({
      playerInventoryItem: {
        findMany: vi.fn().mockResolvedValue([
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
    } as never);

    const result = await repository.listPlayerItems("player-1");

    expect(result).toEqual([
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

  it("purchases an item in one transaction", async () => {
    const now = new Date("2026-03-16T20:00:00.000Z");
    const transaction = {
      player: {
        findUnique: vi.fn().mockResolvedValue({
          id: "player-1",
          cash: 2500
        }),
        update: vi.fn().mockResolvedValue({
          id: "player-1",
          cash: 2100
        })
      },
      playerInventoryItem: {
        create: vi.fn().mockResolvedValue({
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
    const repository = new PrismaInventoryRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

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

    expect(result).toEqual({
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

  it("rejects purchases that would make player cash negative", async () => {
    const transaction = {
      player: {
        findUnique: vi.fn().mockResolvedValue({
          id: "player-1",
          cash: 100
        }),
        update: vi.fn()
      },
      playerInventoryItem: {
        create: vi.fn()
      }
    };
    const repository = new PrismaInventoryRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    await expect(
      repository.purchaseItem({
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
      })
    ).rejects.toBeInstanceOf(InsufficientCashForItemError);
  });

  it("equips an owned item and clears the slot from any previous item", async () => {
    const now = new Date("2026-03-16T20:00:00.000Z");
    const transaction = {
      playerInventoryItem: {
        findUnique: vi.fn().mockResolvedValue({
          id: "owned-2",
          playerId: "player-1",
          itemId: "cheap-pistol",
          equippedSlot: null,
          marketListingId: null,
          acquiredAt: now,
          createdAt: now,
          updatedAt: now
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn().mockResolvedValue({
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
    const repository = new PrismaInventoryRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.equipItem({
      playerId: "player-1",
      inventoryItemId: "owned-2",
      slot: "weapon"
    });

    expect(result?.equippedSlot).toBe("weapon");
  });

  it("unequips the currently equipped slot item", async () => {
    const now = new Date("2026-03-16T20:00:00.000Z");
    const transaction = {
      playerInventoryItem: {
        findMany: vi.fn().mockResolvedValue([
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
        update: vi.fn().mockResolvedValue({
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
    const repository = new PrismaInventoryRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.unequipSlot("player-1", "weapon");

    expect(result?.equippedSlot).toBeNull();
  });
});
