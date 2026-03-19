import { describe, expect, it, vi } from "vitest";

import { PrismaLeaderboardRepository } from "./prisma-leaderboard.repository";

describe("PrismaLeaderboardRepository", () => {
  it("queries richest players with explicit stable ordering", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "player-1",
        displayName: "Boss",
        cash: 9000,
        createdAt: new Date("2026-03-18T10:00:00.000Z")
      }
    ]);
    const repository = new PrismaLeaderboardRepository({
      player: {
        findMany
      }
    } as never);

    const result = await repository.listLeaderboardRecords("richest_players", 5);

    expect(findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        displayName: true,
        cash: true,
        createdAt: true
      },
      orderBy: [
        {
          cash: "desc"
        },
        {
          createdAt: "asc"
        },
        {
          id: "asc"
        }
      ],
      take: 5
    });
    expect(result).toEqual([
      {
        playerId: "player-1",
        displayName: "Boss",
        createdAt: new Date("2026-03-18T10:00:00.000Z"),
        metricValue: 9000
      }
    ]);
  });

  it("queries most respected players with explicit stable ordering", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "player-2",
        displayName: "Capo",
        respect: 120,
        createdAt: new Date("2026-03-18T10:00:00.000Z")
      }
    ]);
    const repository = new PrismaLeaderboardRepository({
      player: {
        findMany
      }
    } as never);

    const result = await repository.listLeaderboardRecords(
      "most_respected_players",
      5
    );

    expect(findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        displayName: true,
        respect: true,
        createdAt: true
      },
      orderBy: [
        {
          respect: "desc"
        },
        {
          createdAt: "asc"
        },
        {
          id: "asc"
        }
      ],
      take: 5
    });
    expect(result[0]?.metricValue).toBe(120);
  });

  it("builds the achievements leaderboard from unlocked achievement rows", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "player-3",
        displayName: "Newer",
        createdAt: new Date("2026-03-18T12:00:00.000Z"),
        achievements: [{ id: "a-1" }, { id: "a-2" }]
      },
      {
        id: "player-2",
        displayName: "Older",
        createdAt: new Date("2026-03-18T10:00:00.000Z"),
        achievements: [{ id: "a-3" }, { id: "a-4" }]
      },
      {
        id: "player-1",
        displayName: "Solo",
        createdAt: new Date("2026-03-18T09:00:00.000Z"),
        achievements: [{ id: "a-5" }]
      }
    ]);
    const repository = new PrismaLeaderboardRepository({
      player: {
        findMany
      }
    } as never);

    const result = await repository.listLeaderboardRecords(
      "most_achievements_unlocked",
      2
    );

    expect(findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        displayName: true,
        createdAt: true,
        achievements: {
          where: {
            unlockedAt: {
              not: null
            }
          },
          select: {
            id: true
          }
        }
      }
    });
    expect(result).toEqual([
      {
        playerId: "player-2",
        displayName: "Older",
        createdAt: new Date("2026-03-18T10:00:00.000Z"),
        metricValue: 2
      },
      {
        playerId: "player-3",
        displayName: "Newer",
        createdAt: new Date("2026-03-18T12:00:00.000Z"),
        metricValue: 2
      }
    ]);
  });
});
