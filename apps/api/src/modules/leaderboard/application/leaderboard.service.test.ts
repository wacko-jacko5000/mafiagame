import { describe, expect, it, vi } from "vitest";

import { LeaderboardService } from "./leaderboard.service";
import type { LeaderboardRepository } from "./leaderboard.repository";

function createLeaderboardRepositoryMock(): LeaderboardRepository {
  return {
    listLeaderboardRecords: vi.fn()
  };
}

describe("LeaderboardService", () => {
  it("lists the static leaderboard definitions", () => {
    const service = new LeaderboardService(createLeaderboardRepositoryMock());

    expect(service.listLeaderboards().map((leaderboard) => leaderboard.id)).toEqual([
      "richest_players",
      "most_respected_players",
      "most_achievements_unlocked"
    ]);
  });

  it("returns a leaderboard with sequential ranks", async () => {
    const repository = createLeaderboardRepositoryMock();
    vi.mocked(repository.listLeaderboardRecords).mockResolvedValueOnce([
      {
        playerId: "player-1",
        displayName: "Boss",
        createdAt: new Date("2026-03-18T10:00:00.000Z"),
        metricValue: 9000
      },
      {
        playerId: "player-2",
        displayName: "Capo",
        createdAt: new Date("2026-03-18T11:00:00.000Z"),
        metricValue: 7500
      }
    ]);

    const service = new LeaderboardService(repository);
    const result = await service.getLeaderboard("richest_players", 2);

    expect(repository.listLeaderboardRecords).toHaveBeenCalledWith(
      "richest_players",
      2
    );
    expect(result.entries).toEqual([
      {
        rank: 1,
        playerId: "player-1",
        displayName: "Boss",
        metricValue: 9000
      },
      {
        rank: 2,
        playerId: "player-2",
        displayName: "Capo",
        metricValue: 7500
      }
    ]);
  });

  it("uses the board default limit when none is provided", async () => {
    const repository = createLeaderboardRepositoryMock();
    vi.mocked(repository.listLeaderboardRecords).mockResolvedValueOnce([]);

    const service = new LeaderboardService(repository);
    await service.getLeaderboard("most_respected_players");

    expect(repository.listLeaderboardRecords).toHaveBeenCalledWith(
      "most_respected_players",
      10
    );
  });

  it("caps the requested limit at the board maximum", async () => {
    const repository = createLeaderboardRepositoryMock();
    vi.mocked(repository.listLeaderboardRecords).mockResolvedValueOnce([]);

    const service = new LeaderboardService(repository);
    const result = await service.getLeaderboard("most_achievements_unlocked", 999);

    expect(result.limit).toBe(50);
    expect(repository.listLeaderboardRecords).toHaveBeenCalledWith(
      "most_achievements_unlocked",
      50
    );
  });

  it("rejects unknown leaderboard ids", async () => {
    const service = new LeaderboardService(createLeaderboardRepositoryMock());

    await expect(service.getLeaderboard("strongest_players")).rejects.toThrow(
      'Leaderboard "strongest_players" was not found.'
    );
  });
});
