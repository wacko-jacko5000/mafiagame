import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { PlayerService } from "../../player/application/player.service";
import type { AchievementDefinition, AchievementTriggerType, PlayerAchievementView } from "../domain/achievements.types";
import { type AchievementsRepository } from "./achievements.repository";
export declare class AchievementsService {
    private readonly playerService;
    private readonly domainEventsService;
    private readonly achievementsRepository;
    constructor(playerService: PlayerService, domainEventsService: DomainEventsService, achievementsRepository: AchievementsRepository);
    listAchievements(): readonly AchievementDefinition[];
    listPlayerAchievements(playerId: string): Promise<PlayerAchievementView[]>;
    recordProgress(playerId: string, triggerType: AchievementTriggerType, amount?: number): Promise<void>;
    private publishUnlockedEvent;
    private toAchievementView;
}
