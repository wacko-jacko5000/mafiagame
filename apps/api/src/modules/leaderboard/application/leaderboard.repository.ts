import type {
  LeaderboardId,
  LeaderboardMetricRecord
} from "../domain/leaderboard.types";

export const LEADERBOARD_REPOSITORY = Symbol("LEADERBOARD_REPOSITORY");

export interface LeaderboardRepository {
  listLeaderboardRecords(
    leaderboardId: LeaderboardId,
    limit: number
  ): Promise<LeaderboardMetricRecord[]>;
}
