"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const missions_progress_events_1 = require("./missions-progress.events");
(0, vitest_1.describe)("MissionsProgressEventsHandler", () => {
    (0, vitest_1.it)("records progress for supported gameplay events", async () => {
        const domainEventsService = new domain_events_service_1.DomainEventsService();
        const missionsService = {
            recordProgress: vitest_1.vi.fn()
        };
        const handler = new missions_progress_events_1.MissionsProgressEventsHandler(domainEventsService, missionsService);
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
            hospitalizedUntil: new Date("2026-03-18T10:12:00.000Z")
        });
        await domainEventsService.publish({
            type: "territory.district_claimed",
            occurredAt: new Date("2026-03-18T10:03:00.000Z"),
            playerId: "player-5",
            gangId: "gang-1",
            districtId: "district-1"
        });
        (0, vitest_1.expect)(missionsService.recordProgress).toHaveBeenCalledTimes(4);
        (0, vitest_1.expect)(missionsService.recordProgress).toHaveBeenNthCalledWith(1, "player-1", "crime_count");
        (0, vitest_1.expect)(missionsService.recordProgress).toHaveBeenNthCalledWith(2, "player-2", "buy_items", 1, { itemType: "weapon" });
        (0, vitest_1.expect)(missionsService.recordProgress).toHaveBeenNthCalledWith(3, "player-3", "win_combat");
        (0, vitest_1.expect)(missionsService.recordProgress).toHaveBeenNthCalledWith(4, "player-5", "control_districts");
    });
});
