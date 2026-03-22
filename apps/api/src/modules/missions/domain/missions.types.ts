import type { ItemType } from "../../inventory/domain/inventory.types";
import type { PlayerResources } from "../../player/domain/player.types";

export type MissionObjectiveType =
  | "crime_count"
  | "earn_money"
  | "reach_respect"
  | "buy_items"
  | "equip_weapon"
  | "equip_armor"
  | "equip_loadout"
  | "win_combat"
  | "own_items"
  | "join_gang"
  | "recruit_member"
  | "control_districts";

export type MissionStatus = "active" | "completed";

export interface MissionDefinition {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  objectiveType: MissionObjectiveType;
  target: number;
  rewardCash: number;
  rewardRespect: number;
  isRepeatable: boolean;
  itemType?: ItemType;
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
