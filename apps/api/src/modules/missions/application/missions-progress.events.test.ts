import { describe, expect, it, vi } from "vitest";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { MissionsProgressEventsHandler } from "./missions-progress.events";
import { MissionsService } from "./missions.service";

describe("MissionsProgressEventsHandler", () => {
  it("records progress for supported gameplay events", async () => {
    const domainEventsService = new DomainEventsService();
    const missionsService = {
      recordProgress: vi.fn()
    } as unknown as MissionsService;
    const handler = new MissionsProgressEventsHandler(domainEventsService, missionsService);

    handler.onModuleInit();

    await domainEventsService.publish({
      type: "crime.completed",
      occurredAt: new Date("2026-03-18T10:00:00.000Z"),
      playerId: "player-1",
      crimeId: "pickpocket",
      success: true,
      cashAwarded: 120,
      respectAwarded: 1,
      consequenceType: "none"
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
      hospitalizedUntil: new Date("2026-03-18T10:12:00.000Z"),
      cashStolen: 375
    });
    await domainEventsService.publish({
      type: "territory.district_claimed",
      occurredAt: new Date("2026-03-18T10:03:00.000Z"),
      playerId: "player-5",
      gangId: "gang-1",
      districtId: "district-1"
    });

    expect(missionsService.recordProgress).toHaveBeenCalledTimes(4);
    expect(missionsService.recordProgress).toHaveBeenNthCalledWith(
      1,
      "player-1",
      "crime_count"
    );
    expect(missionsService.recordProgress).toHaveBeenNthCalledWith(
      2,
      "player-2",
      "buy_items",
      1,
      { itemType: "weapon" }
    );
    expect(missionsService.recordProgress).toHaveBeenNthCalledWith(
      3,
      "player-3",
      "win_combat"
    );
    expect(missionsService.recordProgress).toHaveBeenNthCalledWith(
      4,
      "player-5",
      "control_districts"
    );
  });
});
