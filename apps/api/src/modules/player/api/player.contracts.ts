export interface CreatePlayerRequestBody {
  displayName: string;
}

export interface PlayerResponseBody {
  id: string;
  displayName: string;
  cash: number;
  level: number;
  rank: string;
  currentRespect: number;
  currentLevelMinRespect: number;
  nextLevel: number | null;
  nextRank: string | null;
  nextLevelRespectRequired: number | null;
  respectToNextLevel: number | null;
  progressPercent: number;
  energy: number;
  health: number;
  jailedUntil: string | null;
  hospitalizedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerResourcesResponseBody {
  cash: number;
  respect: number;
  energy: number;
  health: number;
}
