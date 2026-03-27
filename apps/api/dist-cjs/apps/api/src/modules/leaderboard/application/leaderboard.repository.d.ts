import type { LeaderboardId, LeaderboardMetricRecord } from "../domain/leaderboard.types";
export declare const LEADERBOARD_REPOSITORY: unique symbol;
export interface LeaderboardRepository {
    listLeaderboardRecords(leaderboardId: LeaderboardId, limit: number): Promise<LeaderboardMetricRecord[]>;
}
