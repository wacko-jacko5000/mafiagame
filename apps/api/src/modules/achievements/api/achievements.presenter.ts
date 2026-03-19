import type {
  AchievementDefinition,
  PlayerAchievementView
} from "../domain/achievements.types";
import type {
  AchievementDefinitionResponseBody,
  PlayerAchievementResponseBody
} from "./achievements.contracts";

export function toAchievementDefinitionResponseBody(
  achievement: AchievementDefinition
): AchievementDefinitionResponseBody {
  return {
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    triggerType: achievement.triggerType,
    targetCount: achievement.targetCount
  };
}

export function toPlayerAchievementResponseBody(
  achievement: PlayerAchievementView
): PlayerAchievementResponseBody {
  return {
    playerId: achievement.playerId,
    achievementId: achievement.achievementId,
    progress: achievement.progress,
    targetProgress: achievement.targetProgress,
    unlockedAt: achievement.unlockedAt?.toISOString() ?? null,
    definition: toAchievementDefinitionResponseBody(achievement.definition)
  };
}
