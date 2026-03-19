import { describe, expect, it, vi } from "vitest";

import { PrismaCombatRepository } from "./prisma-combat.repository";

describe("PrismaCombatRepository", () => {
  it("applies damage and hospitalization in one transaction", async () => {
    const transaction = {
      player: {
        findUnique: vi.fn().mockResolvedValue({
          id: "target-1",
          health: 15,
          hospitalizedUntil: null
        }),
        update: vi.fn().mockResolvedValue({
          id: "target-1",
          health: 3,
          hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z")
        })
      }
    };
    const repository = new PrismaCombatRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.applyAttack({
      attackerId: "attacker-1",
      targetId: "target-1",
      damageDealt: 12,
      hospitalThreshold: 10,
      hospitalDurationSeconds: 600,
      now: new Date("2026-03-16T22:00:00.000Z")
    });

    expect(result).toEqual({
      targetHealthBefore: 15,
      targetHealthAfter: 3,
      targetHospitalized: true,
      hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z")
    });
  });

  it("never lets health go below zero", async () => {
    const transaction = {
      player: {
        findUnique: vi.fn().mockResolvedValue({
          id: "target-1",
          health: 5,
          hospitalizedUntil: null
        }),
        update: vi.fn().mockResolvedValue({
          id: "target-1",
          health: 0,
          hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z")
        })
      }
    };
    const repository = new PrismaCombatRepository({
      $transaction: vi.fn().mockImplementation((callback) => callback(transaction))
    } as never);

    const result = await repository.applyAttack({
      attackerId: "attacker-1",
      targetId: "target-1",
      damageDealt: 50,
      hospitalThreshold: 10,
      hospitalDurationSeconds: 600,
      now: new Date("2026-03-16T22:00:00.000Z")
    });

    expect(result?.targetHealthAfter).toBe(0);
  });
});
