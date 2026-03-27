import type { AchievementDefinition, PlayerAchievementView } from "../domain/achievements.types";
import type { AchievementDefinitionResponseBody, PlayerAchievementResponseBody } from "./achievements.contracts";
export declare function toAchievementDefinitionResponseBody(achievement: AchievementDefinition): AchievementDefinitionResponseBody;
export declare function toPlayerAchievementResponseBody(achievement: PlayerAchievementView): PlayerAchievementResponseBody;
