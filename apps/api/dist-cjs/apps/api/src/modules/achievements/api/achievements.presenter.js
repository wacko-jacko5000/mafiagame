"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAchievementDefinitionResponseBody = toAchievementDefinitionResponseBody;
exports.toPlayerAchievementResponseBody = toPlayerAchievementResponseBody;
function toAchievementDefinitionResponseBody(achievement) {
    return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        triggerType: achievement.triggerType,
        targetCount: achievement.targetCount
    };
}
function toPlayerAchievementResponseBody(achievement) {
    return {
        playerId: achievement.playerId,
        achievementId: achievement.achievementId,
        progress: achievement.progress,
        targetProgress: achievement.targetProgress,
        unlockedAt: achievement.unlockedAt?.toISOString() ?? null,
        definition: toAchievementDefinitionResponseBody(achievement.definition)
    };
}
