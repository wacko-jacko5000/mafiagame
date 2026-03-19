import type { PlayerResources } from "../../player/domain/player.types";

export type MissionObjectiveType =
  | "commit_crime_n_times"
  | "buy_item_n_times"
  | "win_combat_n_times"
  | "claim_district_once";

export type MissionStatus = "active" | "completed";

export interface MissionDefinition {
  id: string;
  name: string;
  description: string;
  objectiveType: MissionObjectiveType;
  objectiveTarget: number;
  rewardCash: number;
  rewardRespect: number;
  isRepeatable: boolean;
}

export interface PlayerMissionSnapshot {
  id: string;
  playerId: string;
  missionId: string;
  status: MissionStatus;
  progress: number;
  targetProgress: number;
  acceptedAt: Date;
  completedAt: Date | null;
}

export interface PlayerMissionView extends PlayerMissionSnapshot {
  definition: MissionDefinition;
}

export interface MissionCompletionResult {
  mission: PlayerMissionView;
  rewards: {
    cash: number;
    respect: number;
  };
  playerResources: PlayerResources;
}
