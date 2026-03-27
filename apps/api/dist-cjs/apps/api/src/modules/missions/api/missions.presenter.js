"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMissionDefinitionResponseBody = toMissionDefinitionResponseBody;
exports.toPlayerMissionResponseBody = toPlayerMissionResponseBody;
exports.toMissionCompletionResponseBody = toMissionCompletionResponseBody;
function toMissionDefinitionResponseBody(mission) {
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
function toPlayerMissionResponseBody(mission) {
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
function toMissionCompletionResponseBody(result) {
    return {
        mission: toPlayerMissionResponseBody(result.mission),
        rewards: result.rewards,
        playerResources: result.playerResources
    };
}
