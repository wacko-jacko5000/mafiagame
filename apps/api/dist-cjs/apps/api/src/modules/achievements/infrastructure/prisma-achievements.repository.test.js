"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_achievements_repository_1 = require("./prisma-achievements.repository");
(0, vitest_1.describe)("PrismaAchievementsRepository", () => {
    (0, vitest_1.it)("lists player achievement rows", async () => {
        const findMany = vitest_1.vi.fn().mockResolvedValue([
            {
                id: crypto.randomUUID(),
                playerId: "player-1",
                achievementId: "buy_first_item",
                progress: 1,
                targetProgress: 1,
                unlockedAt: new Date("2026-03-18T10:00:00.000Z")
            }
        ]);
        const repository = new prisma_achievements_repository_1.PrismaAchievementsRepository({
            playerAchievement: {
                findMany
            }
        });
        const result = await repository.listByPlayerId("player-1");
        (0, vitest_1.expect)(findMany).toHaveBeenCalledWith({
            where: {
                playerId: "player-1"
            },
            orderBy: [
                {
                    achievementId: "asc"
                }
            ]
        });
        (0, vitest_1.expect)(result[0]?.achievementId).toBe("buy_first_item");
    });
    (0, vitest_1.it)("creates a player achievement row", async () => {
        const repository = new prisma_achievements_repository_1.PrismaAchievementsRepository({
            playerAchievement: {
                create: vitest_1.vi.fn().mockResolvedValue({
                    id: crypto.randomUUID(),
                    playerId: "player-1",
                    achievementId: "buy_first_item",
                    progress: 1,
                    targetProgress: 1,
                    unlockedAt: new Date("2026-03-18T10:00:00.000Z")
                })
            }
        });
        const result = await repository.createAchievement({
            playerId: "player-1",
            achievementId: "buy_first_item",
            progress: 1,
            targetProgress: 1,
            unlockedAt: new Date("2026-03-18T10:00:00.000Z")
        });
        (0, vitest_1.expect)(result).toMatchObject({
            playerId: "player-1",
            achievementId: "buy_first_item",
            progress: 1,
            targetProgress: 1
        });
    });
    (0, vitest_1.it)("updates player achievement progress", async () => {
        const unlockedAt = new Date("2026-03-18T10:00:00.000Z");
        const update = vitest_1.vi.fn().mockResolvedValue({
            id: "achievement-1",
            playerId: "player-1",
            achievementId: "buy_first_item",
            progress: 1,
            targetProgress: 1,
            unlockedAt
        });
        const repository = new prisma_achievements_repository_1.PrismaAchievementsRepository({
            playerAchievement: {
                update
            }
        });
        const result = await repository.updateProgress({
            playerAchievementId: "achievement-1",
            progress: 1,
            targetProgress: 1,
            unlockedAt
        });
        (0, vitest_1.expect)(update).toHaveBeenCalledWith({
            where: {
                id: "achievement-1"
            },
            data: {
                progress: 1,
                targetProgress: 1,
                unlockedAt
            }
        });
        (0, vitest_1.expect)(result.achievementId).toBe("buy_first_item");
    });
});
