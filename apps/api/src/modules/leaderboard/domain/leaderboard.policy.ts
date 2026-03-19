import type { LeaderboardMetricRecord } from "./leaderboard.types";

export function compareLeaderboardMetricRecords(
  left: LeaderboardMetricRecord,
  right: LeaderboardMetricRecord
): number {
  if (left.metricValue !== right.metricValue) {
    return right.metricValue - left.metricValue;
  }

  if (left.createdAt.getTime() !== right.createdAt.getTime()) {
    return left.createdAt.getTime() - right.createdAt.getTime();
  }

  return left.playerId.localeCompare(right.playerId);
}
