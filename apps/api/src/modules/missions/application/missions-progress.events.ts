import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import type {
  CombatWonEvent,
  CrimeCompletedEvent,
  InventoryItemPurchasedEvent,
  TerritoryDistrictClaimedEvent
} from "../../../platform/domain-events/domain-events.types";
import { MissionsService } from "./missions.service";

@Injectable()
export class MissionsProgressEventsHandler implements OnModuleInit, OnModuleDestroy {
  private readonly unsubscribers: Array<() => void> = [];

  constructor(
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(MissionsService)
    private readonly missionsService: MissionsService
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
      )
    );
  }

  onModuleDestroy(): void {
    for (const unsubscribe of this.unsubscribers.splice(0)) {
      unsubscribe();
    }
  }

  private async handleCrimeCompleted(event: CrimeCompletedEvent): Promise<void> {
    if (!event.success) {
      return;
    }

    await this.missionsService.recordProgress(event.playerId, "crime_count");
  }

  private async handleInventoryItemPurchased(
    event: InventoryItemPurchasedEvent
  ): Promise<void> {
    const itemType = event.itemId.includes("armor") ? "armor" : "weapon";

    await this.missionsService.recordProgress(event.playerId, "buy_items", 1, {
      itemType
    });
  }

  private async handleCombatWon(event: CombatWonEvent): Promise<void> {
    await this.missionsService.recordProgress(event.attackerPlayerId, "win_combat");
  }

  private async handleTerritoryDistrictClaimed(
    event: TerritoryDistrictClaimedEvent
  ): Promise<void> {
    await this.missionsService.recordProgress(event.playerId, "control_districts");
  }
}
