import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { MissionsService } from "./missions.service";
export declare class MissionsProgressEventsHandler implements OnModuleInit, OnModuleDestroy {
    private readonly domainEventsService;
    private readonly missionsService;
    private readonly unsubscribers;
    constructor(domainEventsService: DomainEventsService, missionsService: MissionsService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private handleCrimeCompleted;
    private handleInventoryItemPurchased;
    private handleCombatWon;
    private handleTerritoryDistrictClaimed;
}
