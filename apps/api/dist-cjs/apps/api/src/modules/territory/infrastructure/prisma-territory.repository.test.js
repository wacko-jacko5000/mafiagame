"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_territory_repository_1 = require("./prisma-territory.repository");
(0, vitest_1.describe)("PrismaTerritoryRepository", () => {
    (0, vitest_1.it)("lists persisted districts with current control and payout config", async () => {
        const now = new Date("2026-03-17T00:05:00.000Z");
        const repository = new prisma_territory_repository_1.PrismaTerritoryRepository({
            district: {
                findMany: vitest_1.vi.fn().mockResolvedValue([
                    {
                        id: "district-1",
                        name: "Downtown",
                        payoutAmount: 1000,
                        payoutCooldownMinutes: 60,
                        createdAt: now,
                        control: null,
                        wars: []
                    }
                ])
            }
        });
        const result = await repository.listDistricts();
        (0, vitest_1.expect)(result).toEqual([
            {
                id: "district-1",
                name: "Downtown",
                payoutAmount: 1000,
                payoutCooldownMinutes: 60,
                createdAt: now,
                control: null,
                activeWar: null
            }
        ]);
    });
    (0, vitest_1.it)("claims a district by upserting the current control row", async () => {
        const now = new Date("2026-03-17T00:10:00.000Z");
        const transaction = {
            district: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "district-1",
                    name: "Downtown",
                    payoutAmount: 1000,
                    payoutCooldownMinutes: 60,
                    createdAt: new Date("2026-03-17T00:05:00.000Z"),
                    control: null,
                    wars: []
                })
            },
            districtControl: {
                upsert: vitest_1.vi.fn().mockResolvedValue({
                    id: "control-1",
                    districtId: "district-1",
                    gangId: "gang-1",
                    capturedAt: now,
                    lastPayoutClaimedAt: null
                })
            }
        };
        const repository = new prisma_territory_repository_1.PrismaTerritoryRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.claimDistrict({
            districtId: "district-1",
            gangId: "gang-1"
        });
        (0, vitest_1.expect)(result).toEqual({
            id: "control-1",
            districtId: "district-1",
            gangId: "gang-1",
            capturedAt: now,
            lastPayoutClaimedAt: null
        });
    });
    (0, vitest_1.it)("claims a district payout only when the cooldown condition matches", async () => {
        const now = new Date("2026-03-17T03:00:00.000Z");
        const transaction = {
            district: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "district-1",
                    name: "Downtown",
                    payoutAmount: 1000,
                    payoutCooldownMinutes: 60,
                    createdAt: new Date("2026-03-17T00:05:00.000Z"),
                    control: {
                        id: "control-1",
                        districtId: "district-1",
                        gangId: "gang-1",
                        capturedAt: new Date("2026-03-17T00:10:00.000Z"),
                        lastPayoutClaimedAt: null
                    },
                    wars: []
                })
            },
            districtControl: {
                updateMany: vitest_1.vi.fn().mockResolvedValue({
                    count: 1
                })
            }
        };
        const repository = new prisma_territory_repository_1.PrismaTerritoryRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.claimDistrictPayout({
            districtId: "district-1",
            gangId: "gang-1",
            claimedAt: now,
            latestEligibleClaimedAt: new Date("2026-03-17T02:00:00.000Z")
        });
        (0, vitest_1.expect)(result).toBe("claimed");
        (0, vitest_1.expect)(transaction.districtControl.updateMany).toHaveBeenCalledWith({
            where: {
                districtId: "district-1",
                gangId: "gang-1",
                OR: [
                    {
                        lastPayoutClaimedAt: null
                    },
                    {
                        lastPayoutClaimedAt: {
                            lte: new Date("2026-03-17T02:00:00.000Z")
                        }
                    }
                ]
            },
            data: {
                lastPayoutClaimedAt: now
            }
        });
    });
    (0, vitest_1.it)("starts a war record", async () => {
        const now = new Date("2026-03-17T00:45:00.000Z");
        const transaction = {
            district: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "district-1",
                    name: "Downtown",
                    payoutAmount: 1000,
                    payoutCooldownMinutes: 60,
                    createdAt: now,
                    control: {
                        id: "control-1",
                        districtId: "district-1",
                        gangId: "gang-def",
                        capturedAt: now,
                        lastPayoutClaimedAt: null
                    },
                    wars: []
                })
            },
            districtWar: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    id: "war-1",
                    districtId: "district-1",
                    attackerGangId: "gang-att",
                    defenderGangId: "gang-def",
                    startedByPlayerId: "player-1",
                    status: "pending",
                    createdAt: now,
                    resolvedAt: null,
                    winningGangId: null
                })
            }
        };
        const repository = new prisma_territory_repository_1.PrismaTerritoryRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.startWar({
            districtId: "district-1",
            attackerGangId: "gang-att",
            defenderGangId: "gang-def",
            startedByPlayerId: "player-1"
        });
        (0, vitest_1.expect)(result).toMatchObject({
            id: "war-1",
            status: "pending",
            attackerGangId: "gang-att",
            defenderGangId: "gang-def"
        });
    });
    (0, vitest_1.it)("resolves a war and updates district control", async () => {
        const now = new Date("2026-03-17T01:00:00.000Z");
        const transaction = {
            districtWar: {
                findUnique: vitest_1.vi.fn().mockResolvedValue({
                    id: "war-1",
                    districtId: "district-1",
                    attackerGangId: "gang-att",
                    defenderGangId: "gang-def",
                    startedByPlayerId: "player-1",
                    status: "pending",
                    createdAt: new Date("2026-03-17T00:45:00.000Z"),
                    resolvedAt: null,
                    winningGangId: null
                }),
                update: vitest_1.vi.fn().mockResolvedValue({
                    id: "war-1",
                    districtId: "district-1",
                    attackerGangId: "gang-att",
                    defenderGangId: "gang-def",
                    startedByPlayerId: "player-1",
                    status: "resolved",
                    createdAt: new Date("2026-03-17T00:45:00.000Z"),
                    resolvedAt: now,
                    winningGangId: "gang-att"
                })
            },
            districtControl: {
                upsert: vitest_1.vi.fn().mockResolvedValue({
                    id: "control-1",
                    districtId: "district-1",
                    gangId: "gang-att",
                    capturedAt: now,
                    lastPayoutClaimedAt: null
                })
            }
        };
        const repository = new prisma_territory_repository_1.PrismaTerritoryRepository({
            $transaction: vitest_1.vi.fn().mockImplementation((callback) => callback(transaction))
        });
        const result = await repository.resolveWar({
            warId: "war-1",
            winningGangId: "gang-att"
        });
        (0, vitest_1.expect)(result).toMatchObject({
            id: "war-1",
            status: "resolved",
            winningGangId: "gang-att"
        });
    });
});
