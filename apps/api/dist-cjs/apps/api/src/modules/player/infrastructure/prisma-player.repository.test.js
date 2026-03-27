"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_player_repository_1 = require("./prisma-player.repository");
(0, vitest_1.describe)("PrismaPlayerRepository", () => {
    (0, vitest_1.it)("maps prisma players into player snapshots", async () => {
        const now = new Date();
        const repository = new prisma_player_repository_1.PrismaPlayerRepository({
            player: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
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
        });
        const result = await repository.findByDisplayName("Don Luca");
        (0, vitest_1.expect)(result).toMatchObject({
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100
        });
    });
    (0, vitest_1.it)("applies a resource delta inside a transaction", async () => {
        const now = new Date();
        const playerId = crypto.randomUUID();
        const transaction = {
            player: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
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
                update: vitest_1.vi.fn().mockResolvedValue({
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
        const repository = new prisma_player_repository_1.PrismaPlayerRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.applyResourceDelta(playerId, {
            cash: 300,
            respect: 1,
            energy: -15
        });
        (0, vitest_1.expect)(result).toMatchObject({
            cash: 2800,
            respect: 1,
            energy: 85
        });
    });
    (0, vitest_1.it)("regenerates energy on player reads before returning the snapshot", async () => {
        const playerId = crypto.randomUUID();
        const energyUpdatedAt = new Date("2026-03-19T19:00:00.000Z");
        const now = new Date("2026-03-19T19:05:30.000Z");
        const transaction = {
            player: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
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
                update: vitest_1.vi.fn().mockResolvedValue({
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
        const repository = new prisma_player_repository_1.PrismaPlayerRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.findById(playerId, now);
        (0, vitest_1.expect)(transaction.player.update).toHaveBeenCalledWith({
            where: {
                id: playerId
            },
            data: {
                energy: 15,
                energyUpdatedAt: new Date("2026-03-19T19:05:00.000Z")
            }
        });
        (0, vitest_1.expect)(result?.energy).toBe(15);
    });
    (0, vitest_1.it)("updates custody status fields", async () => {
        const now = new Date();
        const playerId = crypto.randomUUID();
        const repository = new prisma_player_repository_1.PrismaPlayerRepository({
            player: {
                update: vitest_1.vi.fn().mockResolvedValue({
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
        });
        const result = await repository.updateCustodyStatus(playerId, {
            jailedUntil: now
        });
        (0, vitest_1.expect)(result?.jailedUntil).toEqual(now);
    });
});
