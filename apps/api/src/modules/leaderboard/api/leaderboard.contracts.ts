export interface LeaderboardDefinitionResponseBody {
  id: string;
  name: string;
  description: string;
  metricKey: string;
  defaultLimit: number;
  maxLimit: number;
}

export interface LeaderboardEntryResponseBody {
  rank: number;
  playerId: string;
  displayName: string;
  metricValue: number;
}

export interface LeaderboardResponseBody extends LeaderboardDefinitionResponseBody {
  limit: number;
  entries: LeaderboardEntryResponseBody[];
}
