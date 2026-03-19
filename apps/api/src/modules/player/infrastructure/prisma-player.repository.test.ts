import { describe, expect, it, vi } from "vitest";

import { PrismaPlayerRepository } from "./prisma-player.repository";

describe("PrismaPlayerRepository", () => {
  it("maps prisma players into player snapshots", async () => {
    const now = new Date();
    const repository = new PrismaPlayerRepository({
      player: {
        findUnique: vi.fn().mockResolvedValue({
          id: crypto.randomUUID(),
          displayName: "Don Luca",
          cash: 2500,
          respect: 0,
          energy: 100,
          energyUpdatedAt: now,
          health: 100,
          jailedUntil: null,
          hospitalizedUntil: null,
          createdAt: now,
          updatedAt: now
        })
      }
    } as never);

    const result = await repository.findByDisplayName("Don Luca");

    expect(result).toMatchObject({
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100
    });
  });

  it("applies a resource delta inside a transaction", async () => {
    const now = new Date();
    const playerId = crypto.randomUUID();
    const transaction = {
      player: {
        findUnique: vi.fn().mockResolvedValue({
          id: playerId,
          displayName: "Don Luca",
          cash: 2500,
          respect: 0,
          energy: 100,
          energyUpdatedAt: now,
          health: 100,
          jailedUntil: null,
          hospitalizedUntil: null,
          createdAt: now,
          updatedAt: now
        }),
        update: vi.fn().mockResolvedValue({
          id: playerId,
          displayName: "Don Luca",
          cash: 2800,
          respect: 1,
          energy: 85,
          energyUpdatedAt: now,
          health: 100,
          jailedUntil: null,
          hospitalizedUntil: null,
          createdAt: now,
          updatedAt: now
        })
      }
    };
    const repository = new PrismaPlayerRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.applyResourceDelta(playerId, {
      cash: 300,
      respect: 1,
      energy: -15
    });

    expect(result).toMatchObject({
      cash: 2800,
      respect: 1,
      energy: 85
    });
  });

  it("regenerates energy on player reads before returning the snapshot", async () => {
    const playerId = crypto.randomUUID();
    const energyUpdatedAt = new Date("2026-03-19T19:00:00.000Z");
    const now = new Date("2026-03-19T19:05:30.000Z");
    const transaction = {
      player: {
        findUnique: vi.fn().mockResolvedValue({
          id: playerId,
          displayName: "Don Luca",
          cash: 2500,
          respect: 0,
          energy: 10,
          energyUpdatedAt,
          health: 100,
          jailedUntil: null,
          hospitalizedUntil: null,
          createdAt: energyUpdatedAt,
          updatedAt: energyUpdatedAt
        }),
        update: vi.fn().mockResolvedValue({
          id: playerId,
          displayName: "Don Luca",
          cash: 2500,
          respect: 0,
          energy: 15,
          energyUpdatedAt: new Date("2026-03-19T19:05:00.000Z"),
          health: 100,
          jailedUntil: null,
          hospitalizedUntil: null,
          createdAt: energyUpdatedAt,
          updatedAt: now
        })
      }
    };
    const repository = new PrismaPlayerRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.findById(playerId, now);

    expect(transaction.player.update).toHaveBeenCalledWith({
      where: {
        id: playerId
      },
      data: {
        energy: 15,
        energyUpdatedAt: new Date("2026-03-19T19:05:00.000Z")
      }
    });
    expect(result?.energy).toBe(15);
  });

  it("updates custody status fields", async () => {
    const now = new Date();
    const playerId = crypto.randomUUID();
    const repository = new PrismaPlayerRepository({
      player: {
        update: vi.fn().mockResolvedValue({
          id: playerId,
          displayName: "Don Luca",
          cash: 2500,
          respect: 0,
          energy: 100,
          energyUpdatedAt: now,
          health: 100,
          jailedUntil: now,
          hospitalizedUntil: null,
          createdAt: now,
          updatedAt: now
        })
      }
    } as never);

    const result = await repository.updateCustodyStatus(playerId, {
      jailedUntil: now
    });

    expect(result?.jailedUntil).toEqual(now);
  });
});
