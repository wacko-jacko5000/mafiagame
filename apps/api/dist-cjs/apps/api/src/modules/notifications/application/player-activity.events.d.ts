import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { GangsService } from "../../gangs/application/gangs.service";
import { PlayerActivityService } from "./player-activity.service";
export declare class PlayerActivityEventsHandler implements OnModuleInit, OnModuleDestroy {
    private readonly domainEventsService;
    private readonly playerActivityService;
    private readonly gangsService;
    private readonly unsubscribers;
    constructor(domainEventsService: DomainEventsService, playerActivityService: PlayerActivityService, gangsService: GangsService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private handleMarketItemSold;
    private handleTerritoryPayoutClaimed;
    private handleTerritoryWarWon;
    private handleAchievementUnlocked;
    private handleGangInviteReceived;
}
