import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import type {
  CombatWonEvent,
  CrimeCompletedEvent,
  InventoryItemPurchasedEvent,
  MarketItemSoldEvent,
  TerritoryDistrictClaimedEvent,
  TerritoryPayoutClaimedEvent,
  TerritoryWarWonEvent
} from "../../../platform/domain-events/domain-events.types";
import { AchievementsService } from "./achievements.service";

@Injectable()
export class AchievementsProgressEventsHandler
  implements OnModuleInit, OnModuleDestroy
{
  private readonly unsubscribers: Array<() => void> = [];

  constructor(
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(AchievementsService)
    private readonly achievementsService: AchievementsService
  ) {}

  onModuleInit(): void {
    this.unsubscribers.push(
      this.domainEventsService.subscribe("crime.completed", (event) =>
        this.handleCrimeCompleted(event)
      ),
      this.domainEventsService.subscribe("inventory.item_purchased", (event) =>
        this.handleInventoryItemPurchased(event)
      ),
      this.domainEventsService.subscribe("combat.won", (event) =>
        this.handleCombatWon(event)
      ),
      this.domainEventsService.subscribe("territory.district_claimed", (event) =>
        this.handleTerritoryDistrictClaimed(event)
      ),
      this.domainEventsService.subscribe("market.item_sold", (event) =>
        this.handleMarketItemSold(event)
      ),
      this.domainEventsService.subscribe("territory.war_won", (event) =>
        this.handleTerritoryWarWon(event)
      ),
      this.domainEventsService.subscribe("territory.payout_claimed", (event) =>
        this.handleTerritoryPayoutClaimed(event)
      )
    );
  }

  onModuleDestroy(): void {
    for (const unsubscribe of this.unsubscribers.splice(0)) {
      unsubscribe();
    }
  }

  private async handleCrimeCompleted(event: CrimeCompletedEvent): Promise<void> {
    await this.achievementsService.recordProgress(
      event.playerId,
      "crime_completed_count"
    );
  }

  private async handleInventoryItemPurchased(
    event: InventoryItemPurchasedEvent
  ): Promise<void> {
    await this.achievementsService.recordProgress(
      event.playerId,
      "inventory_item_purchased_count"
    );
  }

  private async handleCombatWon(event: CombatWonEvent): Promise<void> {
    await this.achievementsService.recordProgress(
      event.attackerPlayerId,
      "combat_won_count"
    );
  }

  private async handleTerritoryDistrictClaimed(
    event: TerritoryDistrictClaimedEvent
  ): Promise<void> {
    await this.achievementsService.recordProgress(
      event.playerId,
      "territory_district_claimed_count"
    );
  }

  private async handleMarketItemSold(event: MarketItemSoldEvent): Promise<void> {
    await this.achievementsService.recordProgress(
      event.sellerPlayerId,
      "market_item_sold_count"
    );
  }

  private handleTerritoryWarWon(_event: TerritoryWarWonEvent): void {
    // War won achievements (territory_war_won_count) require a playerId to credit.
    // The TerritoryWarWonEvent carries gangId only. This will be wired up when
    // territory war auto-resolution is implemented and a startedByPlayerId is available.
  }

  private async handleTerritoryPayoutClaimed(
    event: TerritoryPayoutClaimedEvent
  ): Promise<void> {
    await this.achievementsService.recordProgress(
      event.playerId,
      "territory_payout_claimed_count"
    );
  }
}
