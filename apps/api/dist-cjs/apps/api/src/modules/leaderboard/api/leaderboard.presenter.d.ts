import type { LeaderboardDefinition, LeaderboardEntry, LeaderboardView } from "../domain/leaderboard.types";
import type { LeaderboardDefinitionResponseBody, LeaderboardEntryResponseBody, LeaderboardResponseBody } from "./leaderboard.contracts";
export declare function toLeaderboardDefinitionResponseBody(definition: LeaderboardDefinition): LeaderboardDefinitionResponseBody;
export declare function toLeaderboardEntryResponseBody(entry: LeaderboardEntry): LeaderboardEntryResponseBody;
export declare function toLeaderboardResponseBody(leaderboard: LeaderboardView): LeaderboardResponseBody;
