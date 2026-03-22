export interface MissionDefinitionResponseBody {
  id: string;
  name: string;
  description: string;
  objectiveType: string;
  unlockLevel: number;
  requiredLevel: number;
  target: number;
  objectiveTarget: number;
  rewardCash: number;
  rewardRespect: number;
  isRepeatable: boolean;
  itemType?: "weapon" | "armor";
}

export interface PlayerMissionResponseBody {
  id: string;
  playerId: string;
  missionId: string;
  status: "active" | "completed";
  progress: number;
  targetProgress: number;
  acceptedAt: string;
  completedAt: string | null;
  definition: MissionDefinitionResponseBody;
}

export interface MissionCompletionResponseBody {
  mission: PlayerMissionResponseBody;
  rewards: {
    cash: number;
    respect: number;
  };
  playerResources: {
    cash: number;
    respect: number;
    energy: number;
    health: number;
  };
}
