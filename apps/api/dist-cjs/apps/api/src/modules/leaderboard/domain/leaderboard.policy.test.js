"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const leaderboard_policy_1 = require("./leaderboard.policy");
(0, vitest_1.describe)("compareLeaderboardMetricRecords", () => {
    (0, vitest_1.it)("orders higher metric values first", () => {
        const result = (0, leaderboard_policy_1.compareLeaderboardMetricRecords)({
            playerId: "player-1",
            displayName: "Alpha",
            createdAt: new Date("2026-03-18T10:00:00.000Z"),
            metricValue: 10
        }, {
            playerId: "player-2",
            displayName: "Bravo",
            createdAt: new Date("2026-03-18T09:00:00.000Z"),
            metricValue: 25
        });
        (0, vitest_1.expect)(result).toBeGreaterThan(0);
    });
    (0, vitest_1.it)("breaks ties by older player creation time, then player id", () => {
        const olderCreatedAt = new Date("2026-03-18T09:00:00.000Z");
        const newerCreatedAt = new Date("2026-03-18T10:00:00.000Z");
        (0, vitest_1.expect)((0, leaderboard_policy_1.compareLeaderboardMetricRecords)({
            playerId: "player-b",
            displayName: "Bravo",
            createdAt: olderCreatedAt,
            metricValue: 10
        }, {
            playerId: "player-a",
            displayName: "Alpha",
            createdAt: newerCreatedAt,
            metricValue: 10
        })).toBeLessThan(0);
        (0, vitest_1.expect)((0, leaderboard_policy_1.compareLeaderboardMetricRecords)({
            playerId: "player-a",
            displayName: "Alpha",
            createdAt: olderCreatedAt,
            metricValue: 10
        }, {
            playerId: "player-b",
            displayName: "Bravo",
            createdAt: olderCreatedAt,
            metricValue: 10
        })).toBeLessThan(0);
    });
});
