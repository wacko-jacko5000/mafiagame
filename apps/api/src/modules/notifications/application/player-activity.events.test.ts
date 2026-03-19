import { describe, expect, it, vi } from "vitest";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { GangsService } from "../../gangs/application/gangs.service";
import { PlayerActivityEventsHandler } from "./player-activity.events";
import { PlayerActivityService } from "./player-activity.service";

function createPlayerActivityServiceMock() {
  return {
    createActivity: vi.fn()
  } as unknown as PlayerActivityService;
}

function createGangsServiceMock() {
  return {
    listGangMembers: vi.fn()
  } as unknown as GangsService;
}

describe("PlayerActivityEventsHandler", () => {
  it("creates feed entries for mapped domain events", async () => {
    const domainEventsService = new DomainEventsService();
    const playerActivityService = createPlayerActivityServiceMock();
    const gangsService = createGangsServiceMock();
    vi.mocked(gangsService.listGangMembers).mockResolvedValue([
      {
        id: crypto.randomUUID(),
        gangId: "gang-1",
        playerId: "player-2",
        role: "leader",
        joinedAt: new Date("2026-03-18T09:00:00.000Z"),
        displayName: "Boss"
      }
    ]);

    const handler = new PlayerActivityEventsHandler(
      domainEventsService,
      playerActivityService,
      gangsService
    );

    handler.onModuleInit();

    await domainEventsService.publish({
      type: "market.item_sold",
      occurredAt: new Date("2026-03-18T10:00:00.000Z"),
      listingId: crypto.randomUUID(),
      inventoryItemId: crypto.randomUUID(),
      itemId: "rusty-knife",
      itemName: "Rusty Knife",
      sellerPlayerId: "player-1",
      buyerPlayerId: "player-9",
      price: 900
    });
    await domainEventsService.publish({
      type: "territory.war_won",
      occurredAt: new Date("2026-03-18T11:00:00.000Z"),
      warId: crypto.randomUUID(),
      districtId: crypto.randomUUID(),
      districtName: "Downtown",
      winningGangId: "gang-1",
      winningGangName: "Night Owls",
      attackerGangId: "gang-1",
      defenderGangId: "gang-2",
      resolvedAt: new Date("2026-03-18T11:00:00.000Z")
    });
    await domainEventsService.publish({
      type: "achievements.unlocked",
      occurredAt: new Date("2026-03-18T12:00:00.000Z"),
      playerId: "player-3",
      achievementId: "sell_first_item",
      achievementName: "First Sale",
      achievementDescription: "Sell your first item on the market."
    });

    expect(playerActivityService.createActivity).toHaveBeenCalledWith({
      playerId: "player-1",
      type: "market_item_sold",
      title: "Item sold",
      body: "Your Rusty Knife sold for $900.",
      createdAt: new Date("2026-03-18T10:00:00.000Z")
    });
    expect(playerActivityService.createActivity).toHaveBeenCalledWith({
      playerId: "player-2",
      type: "territory_war_won",
      title: "Territory war won",
      body: "Night Owls won control of Downtown.",
      createdAt: new Date("2026-03-18T11:00:00.000Z")
    });
    expect(playerActivityService.createActivity).toHaveBeenCalledWith({
      playerId: "player-3",
      type: "achievement_unlocked",
      title: "Achievement unlocked",
      body: "First Sale: Sell your first item on the market.",
      createdAt: new Date("2026-03-18T12:00:00.000Z")
    });

    handler.onModuleDestroy();
  });
});
