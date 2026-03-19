import { describe, expect, it, vi } from "vitest";

import { PrismaAchievementsRepository } from "./prisma-achievements.repository";

describe("PrismaAchievementsRepository", () => {
  it("lists player achievement rows", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: crypto.randomUUID(),
        playerId: "player-1",
        achievementId: "buy_first_item",
        progress: 1,
        targetProgress: 1,
        unlockedAt: new Date("2026-03-18T10:00:00.000Z")
      }
    ]);
    const repository = new PrismaAchievementsRepository({
      playerAchievement: {
        findMany
      }
    } as never);

    const result = await repository.listByPlayerId("player-1");

    expect(findMany).toHaveBeenCalledWith({
      where: {
        playerId: "player-1"
      },
      orderBy: [
        {
          achievementId: "asc"
        }
      ]
    });
    expect(result[0]?.achievementId).toBe("buy_first_item");
  });

  it("creates a player achievement row", async () => {
    const repository = new PrismaAchievementsRepository({
      playerAchievement: {
        create: vi.fn().mockResolvedValue({
          id: crypto.randomUUID(),
          playerId: "player-1",
          achievementId: "buy_first_item",
          progress: 1,
          targetProgress: 1,
          unlockedAt: new Date("2026-03-18T10:00:00.000Z")
        })
      }
    } as never);

    const result = await repository.createAchievement({
      playerId: "player-1",
      achievementId: "buy_first_item",
      progress: 1,
      targetProgress: 1,
      unlockedAt: new Date("2026-03-18T10:00:00.000Z")
    });

    expect(result).toMatchObject({
      playerId: "player-1",
      achievementId: "buy_first_item",
      progress: 1,
      targetProgress: 1
    });
  });

  it("updates player achievement progress", async () => {
    const unlockedAt = new Date("2026-03-18T10:00:00.000Z");
    const update = vi.fn().mockResolvedValue({
      id: "achievement-1",
      playerId: "player-1",
      achievementId: "buy_first_item",
      progress: 1,
      targetProgress: 1,
      unlockedAt
    });
    const repository = new PrismaAchievementsRepository({
      playerAchievement: {
        update
      }
    } as never);

    const result = await repository.updateProgress({
      playerAchievementId: "achievement-1",
      progress: 1,
      targetProgress: 1,
      unlockedAt
    });

    expect(update).toHaveBeenCalledWith({
      where: {
        id: "achievement-1"
      },
      data: {
        progress: 1,
        targetProgress: 1,
        unlockedAt
      }
    });
    expect(result.achievementId).toBe("buy_first_item");
  });
});
