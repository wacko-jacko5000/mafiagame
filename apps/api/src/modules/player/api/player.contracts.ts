export interface CreatePlayerRequestBody {
  displayName: string;
}

export interface PlayerResponseBody {
  id: string;
  displayName: string;
  cash: number;
  baseRespect: number;
  assetRespectBonus: number;
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
  heat: number;
  heatUpdatedAt: string;
  health: number;
  parkingSlots: number;
  ownedVehicleCount: number;
  availableVehicleSlots: number;
  jailedUntil: string | null;
  hospitalizedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerResourcesResponseBody {
  cash: number;
  respect: number;
  baseRespect: number;
  assetRespectBonus: number;
  energy: number;
  health: number;
}
