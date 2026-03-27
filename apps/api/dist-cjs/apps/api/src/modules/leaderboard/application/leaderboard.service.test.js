"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const leaderboard_service_1 = require("./leaderboard.service");
function createLeaderboardRepositoryMock() {
    return {
        listLeaderboardRecords: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("LeaderboardService", () => {
    (0, vitest_1.it)("lists the static leaderboard definitions", () => {
        const service = new leaderboard_service_1.LeaderboardService(createLeaderboardRepositoryMock());
        (0, vitest_1.expect)(service.listLeaderboards().map((leaderboard) => leaderboard.id)).toEqual([
            "richest_players",
            "most_respected_players",
            "most_achievements_unlocked"
        ]);
    });
    (0, vitest_1.it)("returns a leaderboard with sequential ranks", async () => {
        const repository = createLeaderboardRepositoryMock();
        vitest_1.vi.mocked(repository.listLeaderboardRecords).mockResolvedValueOnce([
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
        const service = new leaderboard_service_1.LeaderboardService(repository);
        const result = await service.getLeaderboard("richest_players", 2);
        (0, vitest_1.expect)(repository.listLeaderboardRecords).toHaveBeenCalledWith("richest_players", 2);
        (0, vitest_1.expect)(result.entries).toEqual([
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
    (0, vitest_1.it)("uses the board default limit when none is provided", async () => {
        const repository = createLeaderboardRepositoryMock();
        vitest_1.vi.mocked(repository.listLeaderboardRecords).mockResolvedValueOnce([]);
        const service = new leaderboard_service_1.LeaderboardService(repository);
        await service.getLeaderboard("most_respected_players");
        (0, vitest_1.expect)(repository.listLeaderboardRecords).toHaveBeenCalledWith("most_respected_players", 10);
    });
    (0, vitest_1.it)("caps the requested limit at the board maximum", async () => {
        const repository = createLeaderboardRepositoryMock();
        vitest_1.vi.mocked(repository.listLeaderboardRecords).mockResolvedValueOnce([]);
        const service = new leaderboard_service_1.LeaderboardService(repository);
        const result = await service.getLeaderboard("most_achievements_unlocked", 999);
        (0, vitest_1.expect)(result.limit).toBe(50);
        (0, vitest_1.expect)(repository.listLeaderboardRecords).toHaveBeenCalledWith("most_achievements_unlocked", 50);
    });
    (0, vitest_1.it)("rejects unknown leaderboard ids", async () => {
        const service = new leaderboard_service_1.LeaderboardService(createLeaderboardRepositoryMock());
        await (0, vitest_1.expect)(service.getLeaderboard("strongest_players")).rejects.toThrow('Leaderboard "strongest_players" was not found.');
    });
});
