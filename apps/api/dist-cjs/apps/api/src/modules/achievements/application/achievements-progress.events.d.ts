import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { AchievementsService } from "./achievements.service";
export declare class AchievementsProgressEventsHandler implements OnModuleInit, OnModuleDestroy {
    private readonly domainEventsService;
    private readonly achievementsService;
    private readonly unsubscribers;
    constructor(domainEventsService: DomainEventsService, achievementsService: AchievementsService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private handleCrimeCompleted;
    private handleInventoryItemPurchased;
    private handleCombatWon;
    private handleTerritoryDistrictClaimed;
    private handleMarketItemSold;
}
