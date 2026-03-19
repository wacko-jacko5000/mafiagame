import { describe, expect, it } from "vitest";

import { compareLeaderboardMetricRecords } from "./leaderboard.policy";

describe("compareLeaderboardMetricRecords", () => {
  it("orders higher metric values first", () => {
    const result = compareLeaderboardMetricRecords(
      {
        playerId: "player-1",
        displayName: "Alpha",
        createdAt: new Date("2026-03-18T10:00:00.000Z"),
        metricValue: 10
      },
      {
        playerId: "player-2",
        displayName: "Bravo",
        createdAt: new Date("2026-03-18T09:00:00.000Z"),
        metricValue: 25
      }
    );

    expect(result).toBeGreaterThan(0);
  });

  it("breaks ties by older player creation time, then player id", () => {
    const olderCreatedAt = new Date("2026-03-18T09:00:00.000Z");
    const newerCreatedAt = new Date("2026-03-18T10:00:00.000Z");

    expect(
      compareLeaderboardMetricRecords(
        {
          playerId: "player-b",
          displayName: "Bravo",
          createdAt: olderCreatedAt,
          metricValue: 10
        },
        {
          playerId: "player-a",
          displayName: "Alpha",
          createdAt: newerCreatedAt,
          metricValue: 10
        }
      )
    ).toBeLessThan(0);

    expect(
      compareLeaderboardMetricRecords(
        {
          playerId: "player-a",
          displayName: "Alpha",
          createdAt: olderCreatedAt,
          metricValue: 10
        },
        {
          playerId: "player-b",
          displayName: "Bravo",
          createdAt: olderCreatedAt,
          metricValue: 10
        }
      )
    ).toBeLessThan(0);
  });
});
