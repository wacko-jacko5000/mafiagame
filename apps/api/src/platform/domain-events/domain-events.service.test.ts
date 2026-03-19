import { describe, expect, it, vi } from "vitest";

import { DomainEventDispatchError } from "./domain-events.errors";
import { DomainEventsService } from "./domain-events.service";

describe("DomainEventsService", () => {
  it("dispatches events synchronously to subscribed handlers", async () => {
    const service = new DomainEventsService();
    const handler = vi.fn();

    service.subscribe("crime.completed", handler);

    const event = {
      type: "crime.completed" as const,
      occurredAt: new Date("2026-03-18T10:00:00.000Z"),
      playerId: "player-1",
      crimeId: "pickpocket",
      success: true,
      cashAwarded: 120,
      respectAwarded: 1,
      consequenceType: "none" as const
    };

    await service.publish(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("stops dispatching after a handler throws and surfaces the failure", async () => {
    const service = new DomainEventsService();
    const failure = new Error("mission update failed");
    const firstHandler = vi.fn().mockRejectedValue(failure);
    const secondHandler = vi.fn();

    service.subscribe("inventory.item_purchased", firstHandler);
    service.subscribe("inventory.item_purchased", secondHandler);

    await expect(
      service.publish({
        type: "inventory.item_purchased",
        occurredAt: new Date("2026-03-18T10:05:00.000Z"),
        playerId: "player-1",
        inventoryItemId: "owned-1",
        itemId: "rusty-knife",
        price: 400
      })
    ).rejects.toMatchObject({
      name: DomainEventDispatchError.name,
      eventType: "inventory.item_purchased",
      cause: failure
    });

    expect(secondHandler).not.toHaveBeenCalled();
  });
});
