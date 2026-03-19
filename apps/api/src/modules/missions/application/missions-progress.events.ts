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
    await this.missionsService.recordProgress(event.playerId, "commit_crime_n_times");
  }

  private async handleInventoryItemPurchased(
    event: InventoryItemPurchasedEvent
  ): Promise<void> {
    await this.missionsService.recordProgress(event.playerId, "buy_item_n_times");
  }

  private async handleCombatWon(event: CombatWonEvent): Promise<void> {
    await this.missionsService.recordProgress(event.attackerPlayerId, "win_combat_n_times");
  }

  private async handleTerritoryDistrictClaimed(
    event: TerritoryDistrictClaimedEvent
  ): Promise<void> {
    await this.missionsService.recordProgress(event.playerId, "claim_district_once");
  }
}
