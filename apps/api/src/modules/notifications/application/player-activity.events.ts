import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import type {
  AchievementUnlockedEvent,
  GangInviteReceivedEvent,
  MarketItemSoldEvent,
  TerritoryPayoutClaimedEvent,
  TerritoryWarWonEvent
} from "../../../platform/domain-events/domain-events.types";
import { GangsService } from "../../gangs/application/gangs.service";
import { PlayerActivityService } from "./player-activity.service";

@Injectable()
export class PlayerActivityEventsHandler implements OnModuleInit, OnModuleDestroy {
  private readonly unsubscribers: Array<() => void> = [];

  constructor(
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(PlayerActivityService)
    private readonly playerActivityService: PlayerActivityService,
    @Inject(GangsService)
    private readonly gangsService: GangsService
  ) {}

  onModuleInit(): void {
    this.unsubscribers.push(
      this.domainEventsService.subscribe("market.item_sold", (event) =>
        this.handleMarketItemSold(event)
      ),
      this.domainEventsService.subscribe("territory.payout_claimed", (event) =>
        this.handleTerritoryPayoutClaimed(event)
      ),
      this.domainEventsService.subscribe("territory.war_won", (event) =>
        this.handleTerritoryWarWon(event)
      ),
      this.domainEventsService.subscribe("achievements.unlocked", (event) =>
        this.handleAchievementUnlocked(event)
      ),
      this.domainEventsService.subscribe("gangs.invite_received", (event) =>
        this.handleGangInviteReceived(event)
      )
    );
  }

  onModuleDestroy(): void {
    for (const unsubscribe of this.unsubscribers.splice(0)) {
      unsubscribe();
    }
  }

  private async handleMarketItemSold(event: MarketItemSoldEvent): Promise<void> {
    await this.playerActivityService.createActivity({
      playerId: event.sellerPlayerId,
      type: "market_item_sold",
      title: "Item sold",
      body: `Your ${event.itemName} sold for ${formatCash(event.price)}.`,
      createdAt: event.occurredAt
    });
  }

  private async handleTerritoryPayoutClaimed(
    event: TerritoryPayoutClaimedEvent
  ): Promise<void> {
    await this.playerActivityService.createActivity({
      playerId: event.playerId,
      type: "territory_payout_claimed",
      title: "Territory payout claimed",
      body: `You claimed ${formatCash(event.payoutAmount)} from ${event.districtName}.`,
      createdAt: event.occurredAt
    });
  }

  private async handleTerritoryWarWon(event: TerritoryWarWonEvent): Promise<void> {
    const members = await this.gangsService.listGangMembers(event.winningGangId);

    await Promise.all(
      members.map((member) =>
        this.playerActivityService.createActivity({
          playerId: member.playerId,
          type: "territory_war_won",
          title: "Territory war won",
          body: `${event.winningGangName} won control of ${event.districtName}.`,
          createdAt: event.occurredAt
        })
      )
    );
  }

  private async handleAchievementUnlocked(
    event: AchievementUnlockedEvent
  ): Promise<void> {
    await this.playerActivityService.createActivity({
      playerId: event.playerId,
      type: "achievement_unlocked",
      title: "Achievement unlocked",
      body: `${event.achievementName}: ${event.achievementDescription}`,
      createdAt: event.occurredAt
    });
  }

  private async handleGangInviteReceived(
    event: GangInviteReceivedEvent
  ): Promise<void> {
    await this.playerActivityService.createActivity({
      playerId: event.invitedPlayerId,
      type: "gang_invite_received",
      title: "Gang invite received",
      body: `${event.invitedByPlayerDisplayName} invited you to join ${event.gangName}.`,
      createdAt: event.occurredAt
    });
  }
}

function formatCash(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}
