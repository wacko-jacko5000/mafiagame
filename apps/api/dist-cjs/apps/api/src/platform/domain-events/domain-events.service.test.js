"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const domain_events_errors_1 = require("./domain-events.errors");
const domain_events_service_1 = require("./domain-events.service");
(0, vitest_1.describe)("DomainEventsService", () => {
    (0, vitest_1.it)("dispatches events synchronously to subscribed handlers", async () => {
        const service = new domain_events_service_1.DomainEventsService();
        const handler = vitest_1.vi.fn();
        service.subscribe("crime.completed", handler);
        const event = {
            type: "crime.completed",
            occurredAt: new Date("2026-03-18T10:00:00.000Z"),
            playerId: "player-1",
            crimeId: "pickpocket",
            success: true,
            cashAwarded: 120,
            respectAwarded: 1,
            consequenceType: "none"
        };
        await service.publish(event);
        (0, vitest_1.expect)(handler).toHaveBeenCalledWith(event);
    });
    (0, vitest_1.it)("stops dispatching after a handler throws and surfaces the failure", async () => {
        const service = new domain_events_service_1.DomainEventsService();
        const failure = new Error("mission update failed");
        const firstHandler = vitest_1.vi.fn().mockRejectedValue(failure);
        const secondHandler = vitest_1.vi.fn();
        service.subscribe("inventory.item_purchased", firstHandler);
        service.subscribe("inventory.item_purchased", secondHandler);
        await (0, vitest_1.expect)(service.publish({
            type: "inventory.item_purchased",
            occurredAt: new Date("2026-03-18T10:05:00.000Z"),
            playerId: "player-1",
            inventoryItemId: "owned-1",
            itemId: "rusty-knife",
            price: 400
        })).rejects.toMatchObject({
            name: domain_events_errors_1.DomainEventDispatchError.name,
            eventType: "inventory.item_purchased",
            cause: failure
        });
        (0, vitest_1.expect)(secondHandler).not.toHaveBeenCalled();
    });
});
