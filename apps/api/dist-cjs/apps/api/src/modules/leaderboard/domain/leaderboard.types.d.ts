export type LeaderboardId = "richest_players" | "most_respected_players" | "most_achievements_unlocked";
export interface LeaderboardDefinition {
    id: LeaderboardId;
    name: string;
    description: string;
    metricKey: "cash" | "respect" | "achievements_unlocked";
    defaultLimit: number;
    maxLimit: number;
}
export interface LeaderboardMetricRecord {
    playerId: string;
    displayName: string;
    createdAt: Date;
    metricValue: number;
}
export interface LeaderboardEntry {
    rank: number;
    playerId: string;
    displayName: string;
    metricValue: number;
}
export interface LeaderboardView {
    definition: LeaderboardDefinition;
    limit: number;
    entries: LeaderboardEntry[];
}
