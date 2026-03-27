"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_combat_repository_1 = require("./prisma-combat.repository");
(0, vitest_1.describe)("PrismaCombatRepository", () => {
    (0, vitest_1.it)("applies damage and hospitalization in one transaction", async () => {
        const transaction = {
            player: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "target-1",
                    health: 15,
                    hospitalizedUntil: null,
                    hospitalEntryCount: 0
                }),
                update: vitest_1.vi.fn().mockResolvedValue({
                    id: "target-1",
                    health: 3,
                    hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z"),
                    hospitalEntryCount: 1
                })
            }
        };
        const repository = new prisma_combat_repository_1.PrismaCombatRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.applyAttack({
            attackerId: "attacker-1",
            targetId: "target-1",
            damageDealt: 12,
            hospitalThreshold: 10,
            hospitalDurationSeconds: 600,
            hospitalReason: "Gevecht.",
            now: new Date("2026-03-16T22:00:00.000Z")
        });
        (0, vitest_1.expect)(result).toEqual({
            targetHealthBefore: 15,
            targetHealthAfter: 3,
            targetHospitalized: true,
            hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z")
        });
    });
    (0, vitest_1.it)("never lets health go below zero", async () => {
        const transaction = {
            player: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "target-1",
                    health: 5,
                    hospitalizedUntil: null,
                    hospitalEntryCount: 0
                }),
                update: vitest_1.vi.fn().mockResolvedValue({
                    id: "target-1",
                    health: 0,
                    hospitalizedUntil: new Date("2026-03-16T22:10:00.000Z"),
                    hospitalEntryCount: 1
                })
            }
        };
        const repository = new prisma_combat_repository_1.PrismaCombatRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.applyAttack({
            attackerId: "attacker-1",
            targetId: "target-1",
            damageDealt: 50,
            hospitalThreshold: 10,
            hospitalDurationSeconds: 600,
            hospitalReason: "Gevecht.",
            now: new Date("2026-03-16T22:00:00.000Z")
        });
        (0, vitest_1.expect)(result?.targetHealthAfter).toBe(0);
    });
});
