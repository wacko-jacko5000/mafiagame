export interface AchievementDefinitionResponseBody {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  targetCount: number;
}

export interface PlayerAchievementResponseBody {
  playerId: string;
  achievementId: string;
  progress: number;
  targetProgress: number;
  unlockedAt: string | null;
  definition: AchievementDefinitionResponseBody;
}
