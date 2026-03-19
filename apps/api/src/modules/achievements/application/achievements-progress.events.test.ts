import { describe, expect, it, vi } from "vitest";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { AchievementsProgressEventsHandler } from "./achievements-progress.events";
import { AchievementsService } from "./achievements.service";

describe("AchievementsProgressEventsHandler", () => {
  it("records progress for supported gameplay events", async () => {
    const domainEventsService = new DomainEventsService();
    const achievementsService = {
      recordProgress: vi.fn()
    } as unknown as AchievementsService;
    const handler = new AchievementsProgressEventsHandler(
      domainEventsService,
      achievementsService
    );

    handler.onModuleInit();

    await domainEventsService.publish({
      type: "crime.completed",
      occurredAt: new Date("2026-03-18T10:00:00.000Z"),
      playerId: "player-1",
      crimeId: "pickpocket",
      success: false,
      cashAwarded: 0,
      respectAwarded: 0,
      consequenceType: "jail"
    });
    await domainEventsService.publish({
      type: "inventory.item_purchased",
      occurredAt: new Date("2026-03-18T10:01:00.000Z"),
      playerId: "player-2",
      inventoryItemId: "owned-1",
      itemId: "rusty-knife",
      price: 400
    });
    await domainEventsService.publish({
      type: "combat.won",
      occurredAt: new Date("2026-03-18T10:02:00.000Z"),
      attackerPlayerId: "player-3",
      targetPlayerId: "player-4",
      damageDealt: 17,
      hospitalizedUntil: new Date("2026-03-18T10:12:00.000Z")
    });
    await domainEventsService.publish({
      type: "territory.district_claimed",
      occurredAt: new Date("2026-03-18T10:03:00.000Z"),
      playerId: "player-5",
      gangId: "gang-1",
      districtId: "district-1"
    });
    await domainEventsService.publish({
      type: "market.item_sold",
      occurredAt: new Date("2026-03-18T10:04:00.000Z"),
      listingId: "listing-1",
      inventoryItemId: "owned-2",
      itemId: "kevlar-vest",
      itemName: "Kevlar Vest",
      sellerPlayerId: "player-6",
      buyerPlayerId: "player-7",
      price: 800
    });

    expect(achievementsService.recordProgress).toHaveBeenCalledTimes(5);
    expect(achievementsService.recordProgress).toHaveBeenNthCalledWith(
      1,
      "player-1",
      "crime_completed_count"
    );
    expect(achievementsService.recordProgress).toHaveBeenNthCalledWith(
      2,
      "player-2",
      "inventory_item_purchased_count"
    );
    expect(achievementsService.recordProgress).toHaveBeenNthCalledWith(
      3,
      "player-3",
      "combat_won_count"
    );
    expect(achievementsService.recordProgress).toHaveBeenNthCalledWith(
      4,
      "player-5",
      "territory_district_claimed_count"
    );
    expect(achievementsService.recordProgress).toHaveBeenNthCalledWith(
      5,
      "player-6",
      "market_item_sold_count"
    );
  });
});
