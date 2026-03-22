import type {
  MissionCompletionResult,
  MissionDefinition,
  PlayerMissionView
} from "../domain/missions.types";
import type {
  MissionCompletionResponseBody,
  MissionDefinitionResponseBody,
  PlayerMissionResponseBody
} from "./missions.contracts";

export function toMissionDefinitionResponseBody(
  mission: MissionDefinition
): MissionDefinitionResponseBody {
  return {
    id: mission.id,
    name: mission.name,
    description: mission.description,
    objectiveType: mission.objectiveType,
    unlockLevel: mission.unlockLevel,
    requiredLevel: mission.unlockLevel,
    target: mission.target,
    objectiveTarget: mission.target,
    rewardCash: mission.rewardCash,
    rewardRespect: mission.rewardRespect,
    isRepeatable: mission.isRepeatable,
    itemType: mission.itemType
  };
}

export function toPlayerMissionResponseBody(
  mission: PlayerMissionView
): PlayerMissionResponseBody {
  return {
    id: mission.id,
    playerId: mission.playerId,
    missionId: mission.missionId,
    status: mission.status,
    progress: mission.progress,
    targetProgress: mission.targetProgress,
    acceptedAt: mission.acceptedAt.toISOString(),
    completedAt: mission.completedAt?.toISOString() ?? null,
    definition: toMissionDefinitionResponseBody(mission.definition)
  };
}

export function toMissionCompletionResponseBody(
  result: MissionCompletionResult
): MissionCompletionResponseBody {
  return {
    mission: toPlayerMissionResponseBody(result.mission),
    rewards: result.rewards,
    playerResources: result.playerResources
  };
}
