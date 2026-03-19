import type {
  LeaderboardDefinition,
  LeaderboardEntry,
  LeaderboardView
} from "../domain/leaderboard.types";
import type {
  LeaderboardDefinitionResponseBody,
  LeaderboardEntryResponseBody,
  LeaderboardResponseBody
} from "./leaderboard.contracts";

export function toLeaderboardDefinitionResponseBody(
  definition: LeaderboardDefinition
): LeaderboardDefinitionResponseBody {
  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    metricKey: definition.metricKey,
    defaultLimit: definition.defaultLimit,
    maxLimit: definition.maxLimit
  };
}

export function toLeaderboardEntryResponseBody(
  entry: LeaderboardEntry
): LeaderboardEntryResponseBody {
  return {
    rank: entry.rank,
    playerId: entry.playerId,
    displayName: entry.displayName,
    metricValue: entry.metricValue
  };
}

export function toLeaderboardResponseBody(
  leaderboard: LeaderboardView
): LeaderboardResponseBody {
  return {
    ...toLeaderboardDefinitionResponseBody(leaderboard.definition),
    limit: leaderboard.limit,
    entries: leaderboard.entries.map(toLeaderboardEntryResponseBody)
  };
}
