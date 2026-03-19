import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import type {
  CombatWonEvent,
  CrimeCompletedEvent,
  InventoryItemPurchasedEvent,
  MarketItemSoldEvent,
  TerritoryDistrictClaimedEvent
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
}
