import type { LeaderboardDefinition } from "./leaderboard.types";
export declare const leaderboardDefinitions: readonly LeaderboardDefinition[];
export declare function getLeaderboardDefinition(leaderboardId: string): LeaderboardDefinition | null;
