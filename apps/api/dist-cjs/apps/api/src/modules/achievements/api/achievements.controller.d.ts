import { AchievementsService } from "../application/achievements.service";
import type { AchievementDefinitionResponseBody, PlayerAchievementResponseBody } from "./achievements.contracts";
export declare class AchievementsController {
    private readonly achievementsService;
    constructor(achievementsService: AchievementsService);
    getAchievements(): AchievementDefinitionResponseBody[];
    getPlayerAchievements(playerId: string): Promise<PlayerAchievementResponseBody[]>;
}
