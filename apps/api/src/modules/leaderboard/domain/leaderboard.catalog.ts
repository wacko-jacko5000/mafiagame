import type { LeaderboardDefinition, LeaderboardId } from "./leaderboard.types";

export const leaderboardDefinitions: readonly LeaderboardDefinition[] = [
  {
    id: "richest_players",
    name: "Richest Players",
    description: "Players ranked by current cash on hand.",
    metricKey: "cash",
    defaultLimit: 10,
    maxLimit: 50
  },
  {
    id: "most_respected_players",
    name: "Most Respected Players",
    description: "Players ranked by current respect.",
    metricKey: "respect",
    defaultLimit: 10,
    maxLimit: 50
  },
  {
    id: "most_achievements_unlocked",
    name: "Most Achievements Unlocked",
    description: "Players ranked by the number of unlocked achievements.",
    metricKey: "achievements_unlocked",
    defaultLimit: 10,
    maxLimit: 50
  }
];

export function getLeaderboardDefinition(
  leaderboardId: string
): LeaderboardDefinition | null {
  return (
    leaderboardDefinitions.find(
      (definition) => definition.id === (leaderboardId as LeaderboardId)
    ) ?? null
  );
}
