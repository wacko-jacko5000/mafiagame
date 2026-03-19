import { describe, expect, it, vi } from "vitest";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { PlayerService } from "../../player/application/player.service";
import { InsufficientCashForItemError } from "../domain/inventory.errors";
import type { InventoryRepository } from "./inventory.repository";
import { InventoryService } from "./inventory.service";

function createPlayerServiceMock() {
  return {
    getPlayerById: vi.fn()
  } as unknown as PlayerService;
}

function createDomainEventsServiceMock() {
  return {
    publish: vi.fn()
  } as unknown as DomainEventsService;
}

function createInventoryRepositoryMock(): InventoryRepository {
  return {
    findPlayerItemById: vi.fn(),
    equipItem: vi.fn(),
    listPlayerItems: vi.fn(),
    purchaseItem: vi.fn(),
    unequipSlot: vi.fn()
  };
}

describe("InventoryService", () => {
  it("lists the starter shop catalog", () => {
    const service = new InventoryService(
      createPlayerServiceMock(),
      createDomainEventsServiceMock(),
      createInventoryRepositoryMock()
    );

    expect(service.listShopItems().map((item) => item.id)).toEqual([
      "rusty-knife",
      "cheap-pistol",
      "leather-jacket"
    ]);
  });

  it("lists a player's owned inventory", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createInventoryRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.listPlayerItems).mockResolvedValue([
      {
        id: "owned-1",
        playerId,
        itemId: "rusty-knife",
        equippedSlot: null,
        marketListingId: null,
        acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.listPlayerInventory(playerId);

    expect(result[0]).toMatchObject({
      itemId: "rusty-knife",
      name: "Rusty Knife"
    });
  });

  it("purchases an item when the player has enough cash", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createInventoryRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.purchaseItem).mockResolvedValue({
      playerCashAfterPurchase: 2100,
      ownedItem: {
        id: "owned-1",
        playerId,
        itemId: "rusty-knife",
        name: "Rusty Knife",
        type: "weapon",
        price: 400,
        equippedSlot: null,
        marketListingId: null,
        acquiredAt: new Date("2026-03-16T20:00:00.000Z")
      }
    });

    const domainEventsService = createDomainEventsServiceMock();
    const service = new InventoryService(playerService, domainEventsService, repository);
    const result = await service.purchaseItem(playerId, "rusty-knife");

    expect(repository.purchaseItem).toHaveBeenCalledWith({
      playerId,
      item: expect.objectContaining({
        id: "rusty-knife",
        price: 400
      })
    });
    expect(result.playerCashAfterPurchase).toBe(2100);
    expect(domainEventsService.publish).toHaveBeenCalledWith({
      type: "inventory.item_purchased",
      occurredAt: expect.any(Date),
      playerId,
      inventoryItemId: "owned-1",
      itemId: "rusty-knife",
      price: 400
    });
  });

  it("rejects unknown shop items", async () => {
    const service = new InventoryService(
      createPlayerServiceMock(),
      createDomainEventsServiceMock(),
      createInventoryRepositoryMock()
    );

    await expect(
      service.purchaseItem(crypto.randomUUID(), "unknown-item")
    ).rejects.toMatchObject({
      status: 404
    });
  });

  it("lists currently equipped items for a player", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createInventoryRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.listPlayerItems).mockResolvedValue([
      {
        id: crypto.randomUUID(),
        playerId,
        itemId: "rusty-knife",
        equippedSlot: "weapon",
        marketListingId: null,
        acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.getEquippedItems(playerId);

    expect(result.weapon?.itemId).toBe("rusty-knife");
    expect(result.armor).toBeNull();
  });

  it("equips an owned item into a valid slot", async () => {
    const playerId = crypto.randomUUID();
    const inventoryItemId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createInventoryRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.findPlayerItemById).mockResolvedValue({
      id: inventoryItemId,
      playerId,
      itemId: "rusty-knife",
      equippedSlot: null,
      marketListingId: null,
      acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.equipItem).mockResolvedValue({
      id: inventoryItemId,
      playerId,
      itemId: "rusty-knife",
      equippedSlot: "weapon",
      marketListingId: null,
      acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.equipItem(playerId, inventoryItemId, "weapon");

    expect(repository.equipItem).toHaveBeenCalledWith({
      playerId,
      inventoryItemId,
      slot: "weapon"
    });
    expect(result.equippedSlot).toBe("weapon");
  });

  it("rejects invalid slot and item combinations", async () => {
    const playerId = crypto.randomUUID();
    const inventoryItemId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createInventoryRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.findPlayerItemById).mockResolvedValue({
      id: inventoryItemId,
      playerId,
      itemId: "leather-jacket",
      equippedSlot: null,
      marketListingId: null,
      acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );

    await expect(
      service.equipItem(playerId, inventoryItemId, "weapon")
    ).rejects.toMatchObject({
      status: 400
    });
  });

  it("rejects equipping an item that is listed for sale", async () => {
    const playerId = crypto.randomUUID();
    const inventoryItemId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createInventoryRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.findPlayerItemById).mockResolvedValue({
      id: inventoryItemId,
      playerId,
      itemId: "rusty-knife",
      equippedSlot: null,
      marketListingId: crypto.randomUUID(),
      acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );

    await expect(
      service.equipItem(playerId, inventoryItemId, "weapon")
    ).rejects.toMatchObject({
      status: 400
    });
    expect(repository.equipItem).not.toHaveBeenCalled();
  });

  it("unequips a slot", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createInventoryRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.unequipSlot).mockResolvedValue({
      id: crypto.randomUUID(),
      playerId,
      itemId: "rusty-knife",
      equippedSlot: null,
      marketListingId: null,
      acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );
    const result = await service.unequipSlot(playerId, "weapon");

    expect(result?.equippedSlot).toBeNull();
  });

  it("rejects purchases when the player lacks cash", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createInventoryRepositoryMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 100,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.purchaseItem).mockRejectedValue(
      new InsufficientCashForItemError("cheap-pistol")
    );

    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      repository
    );

    await expect(service.purchaseItem(playerId, "cheap-pistol")).rejects.toMatchObject(
      {
        status: 400
      }
    );
  });
});
