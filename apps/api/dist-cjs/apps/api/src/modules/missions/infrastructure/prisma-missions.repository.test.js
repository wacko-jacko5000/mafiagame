"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_missions_repository_1 = require("./prisma-missions.repository");
(0, vitest_1.describe)("PrismaMissionsRepository", () => {
    (0, vitest_1.it)("creates a player mission row", async () => {
        const repository = new prisma_missions_repository_1.PrismaMissionsRepository({
            playerMission: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    id: crypto.randomUUID(),
                    playerId: "player-1",
                    missionId: "crime-spree",
                    status: "active",
                    progress: 0,
                    targetProgress: 3,
                    acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
                    completedAt: null
                })
            }
        });
        const result = await repository.createMission({
            playerId: "player-1",
            missionId: "crime-spree",
            targetProgress: 3,
            acceptedAt: new Date("2026-03-18T10:00:00.000Z")
        });
        (0, vitest_1.expect)(result).toMatchObject({
            playerId: "player-1",
            missionId: "crime-spree",
            status: "active",
            progress: 0,
            targetProgress: 3
        });
    });
    (0, vitest_1.it)("finds a mission by player and mission id", async () => {
        const findUnique = vitest_1.vi.fn().mockResolvedValue({
            id: crypto.randomUUID(),
            playerId: "player-1",
            missionId: "crime-spree",
            status: "active",
            progress: 1,
            targetProgress: 3,
            acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
            completedAt: null
        });
        const repository = new prisma_missions_repository_1.PrismaMissionsRepository({
            playerMission: {
                findUnique
            }
        });
        const result = await repository.findByPlayerAndMissionId("player-1", "crime-spree");
        (0, vitest_1.expect)(findUnique).toHaveBeenCalledWith({
            where: {
                playerId_missionId: {
                    playerId: "player-1",
                    missionId: "crime-spree"
                }
            }
        });
        (0, vitest_1.expect)(result?.progress).toBe(1);
    });
    (0, vitest_1.it)("updates mission progress", async () => {
        const update = vitest_1.vi.fn().mockResolvedValue({
            id: "mission-1",
            playerId: "player-1",
            missionId: "crime-spree",
            status: "active",
            progress: 3,
            targetProgress: 3,
            acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
            completedAt: null
        });
        const repository = new prisma_missions_repository_1.PrismaMissionsRepository({
            playerMission: {
                update
            }
        });
        const result = await repository.updateProgress("mission-1", 3);
        (0, vitest_1.expect)(update).toHaveBeenCalledWith({
            where: {
                id: "mission-1"
            },
            data: {
                progress: 3
            }
        });
        (0, vitest_1.expect)(result.progress).toBe(3);
    });
    (0, vitest_1.it)("marks a mission completed", async () => {
        const completedAt = new Date("2026-03-18T11:00:00.000Z");
        const repository = new prisma_missions_repository_1.PrismaMissionsRepository({
            playerMission: {
                update: vitest_1.vi.fn().mockResolvedValue({
                    id: "mission-1",
                    playerId: "player-1",
                    missionId: "crime-spree",
                    status: "completed",
                    progress: 3,
                    targetProgress: 3,
                    acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
                    completedAt
                })
            }
        });
        const result = await repository.markCompleted("mission-1", completedAt);
        (0, vitest_1.expect)(result.status).toBe("completed");
        (0, vitest_1.expect)(result.completedAt).toEqual(completedAt);
    });
});
