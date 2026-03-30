import { describe, expect, it, vi } from "vitest";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { PlayerService } from "../../player/application/player.service";
import {
  getEquipmentItemById,
  getShopItemById,
  starterShopItemCatalog
} from "../domain/inventory.catalog";
import { InsufficientCashForItemError } from "../domain/inventory.errors";
import type { InventoryRepository } from "./inventory.repository";
import { InventoryBalanceService } from "./inventory-balance.service";
import { InventoryService } from "./inventory.service";

function createPlayerServiceMock() {
  return {
    applyResourceDelta: vi.fn(),
    getPlayerById: vi.fn(),
    getPlayerProgression: vi.fn(),
    getRankNameForLevel: vi.fn((level: number) => {
      const names: Record<number, string> = {
        1: "Scum",
        2: "Empty Suit",
        21: "Legendary Don"
      };
      return names[level] ?? `Level ${level}`;
    })
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
    listPlayerItems: vi.fn().mockResolvedValue([]),
    purchaseItem: vi.fn(),
    unequipSlot: vi.fn()
  };
}

function createInventoryBalanceServiceMock() {
  return {
    listShopItemBalances: vi.fn(() => starterShopItemCatalog),
    findShopItemById: vi.fn((itemId: string) => getShopItemById(itemId) ?? null),
    findEquipmentItemById: vi.fn((itemId: string) => getEquipmentItemById(itemId) ?? null)
  } as unknown as InventoryBalanceService;
}

describe("InventoryService", () => {
  it("lists the starter shop catalog", () => {
    const playerService = createPlayerServiceMock();
    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      createInventoryBalanceServiceMock(),
      createInventoryRepositoryMock()
    );

    expect(service.listShopItems().slice(0, 3)).toEqual([
      expect.objectContaining({
        id: "rusty-knife",
        name: "Glock 17",
        category: "handguns",
        unlockLevel: 1,
        unlockRank: "Scum"
      }),
      expect.objectContaining({
        id: "cheap-pistol",
        name: "Colt M1911",
        category: "handguns",
        unlockLevel: 1,
        unlockRank: "Scum"
      }),
      expect.objectContaining({
        id: "beretta-92fs",
        unlockLevel: 2,
        unlockRank: "Empty Suit"
      })
    ]);
    expect(service.listShopItems().map((item) => item.id)).toContain("leather-jacket");
  });

  it("projects lock state for the current player's shop view", async () => {
    const playerService = createPlayerServiceMock();
    vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
      level: 1,
      rank: "Scum",
      currentRespect: 0,
      currentLevelMinRespect: 0,
      nextLevel: 2,
      nextRank: "Empty Suit",
      nextLevelRespectRequired: 100,
      respectToNextLevel: 100,
      progressPercent: 0
    });

    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      createInventoryBalanceServiceMock(),
      createInventoryRepositoryMock()
    );

    const result = await service.listShopItemsForPlayer(crypto.randomUUID());

    expect(result.find((item) => item.id === "rusty-knife")).toMatchObject({
      isUnlocked: true,
      isLocked: false
    });
    expect(result.find((item) => item.id === "beretta-92fs")).toMatchObject({
      unlockLevel: 2,
      unlockRank: "Empty Suit",
      isUnlocked: false,
      isLocked: true
    });
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
      heat: 0,
      heatUpdatedAt: new Date(),
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
      createInventoryBalanceServiceMock(),
      repository
    );
    const result = await service.listPlayerInventory(playerId);

    expect(result[0]).toMatchObject({
      itemId: "rusty-knife",
      name: "Glock 17"
    });
  });

  it("purchases an item when the player has enough cash", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createInventoryRepositoryMock();
    vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
      level: 1,
      rank: "Scum",
      currentRespect: 0,
      currentLevelMinRespect: 0,
      nextLevel: 2,
      nextRank: "Empty Suit",
      nextLevelRespectRequired: 100,
      respectToNextLevel: 100,
      progressPercent: 0
    });
    vi.mocked(repository.purchaseItem).mockResolvedValue({
      delivery: "inventory",
      playerCashAfterPurchase: 2100,
      playerEnergyAfterPurchase: null,
      playerHealthAfterPurchase: null,
      ownedItem: {
        id: "owned-1",
        playerId,
        itemId: "rusty-knife",
        name: "Glock 17",
        type: "weapon",
        category: "handguns",
        price: 400,
        equipSlot: "weapon",
        unlockLevel: 1,
        equippedSlot: null,
        marketListingId: null,
        weaponStats: {
          damageBonus: 4
        },
        armorStats: null,
        acquiredAt: new Date("2026-03-16T20:00:00.000Z")
      },
      consumedItem: null
    });

    const domainEventsService = createDomainEventsServiceMock();
    const service = new InventoryService(
      playerService,
      domainEventsService,
      createInventoryBalanceServiceMock(),
      repository
    );
    const result = await service.purchaseItem(playerId, "rusty-knife");

    expect(repository.purchaseItem).toHaveBeenCalledWith({
      playerId,
      item: expect.objectContaining({
        id: "rusty-knife",
        price: 400
      })
    });
    expect(result.playerCashAfterPurchase).toBe(2100);
    expect(result.delivery).toBe("inventory");
    expect(domainEventsService.publish).toHaveBeenCalledWith({
      type: "inventory.item_purchased",
      occurredAt: expect.any(Date),
      playerId,
      inventoryItemId: "owned-1",
      itemId: "rusty-knife",
      price: 400
    });
  });

  it("past een directe consumable purchase toe en clampet energy op het maximum", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
      level: 1,
      rank: "Scum",
      currentRespect: 0,
      currentLevelMinRespect: 0,
      nextLevel: 2,
      nextRank: "Empty Suit",
      nextLevelRespectRequired: 100,
      respectToNextLevel: 100,
      progressPercent: 0
    });
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 900,
      respect: 0,
      energy: 75,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 400,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const repository = createInventoryRepositoryMock();
    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      createInventoryBalanceServiceMock(),
      repository
    );

    const result = await service.purchaseItem(playerId, "cocaine");

    expect(playerService.applyResourceDelta).toHaveBeenCalledWith(playerId, {
      cash: -500,
      energy: 40,
      health: 0
    });
    expect(repository.purchaseItem).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      delivery: "instant",
      playerCashAfterPurchase: 400,
      playerEnergyAfterPurchase: 100,
      playerHealthAfterPurchase: 100,
      ownedItem: null,
      consumedItem: {
        id: "cocaine",
        category: "drugs",
        delivery: "instant"
      }
    });
  });

  it("rejects purchases when the player's level is too low", async () => {
    const playerService = createPlayerServiceMock();
    vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
      level: 1,
      rank: "Scum",
      currentRespect: 0,
      currentLevelMinRespect: 0,
      nextLevel: 2,
      nextRank: "Empty Suit",
      nextLevelRespectRequired: 100,
      respectToNextLevel: 100,
      progressPercent: 0
    });

    const repository = createInventoryRepositoryMock();
    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      createInventoryBalanceServiceMock(),
      repository
    );

    await expect(service.purchaseItem(crypto.randomUUID(), "beretta-92fs")).rejects.toMatchObject({
      status: 400
    });
    expect(repository.purchaseItem).not.toHaveBeenCalled();
  });

  it("rejects unknown shop items", async () => {
    const service = new InventoryService(
      createPlayerServiceMock(),
      createDomainEventsServiceMock(),
      createInventoryBalanceServiceMock(),
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
      heat: 0,
      heatUpdatedAt: new Date(),
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
      createInventoryBalanceServiceMock(),
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
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
      level: 1,
      rank: "Scum",
      currentRespect: 0,
      currentLevelMinRespect: 0,
      nextLevel: 2,
      nextRank: "Empty Suit",
      nextLevelRespectRequired: 100,
      respectToNextLevel: 100,
      progressPercent: 0
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
      createInventoryBalanceServiceMock(),
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
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
      level: 5,
      rank: "Soldier",
      currentRespect: 0,
      currentLevelMinRespect: 0,
      nextLevel: 6,
      nextRank: "Capo",
      nextLevelRespectRequired: 100,
      respectToNextLevel: 100,
      progressPercent: 0
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
      createInventoryBalanceServiceMock(),
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
      heat: 0,
      heatUpdatedAt: new Date(),
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
      createInventoryBalanceServiceMock(),
      repository
    );

    await expect(
      service.equipItem(playerId, inventoryItemId, "weapon")
    ).rejects.toMatchObject({
      status: 400
    });
    expect(repository.equipItem).not.toHaveBeenCalled();
  });

  it("rejects equipping an item when the player's level is too low", async () => {
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
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
      level: 1,
      rank: "Scum",
      currentRespect: 0,
      currentLevelMinRespect: 0,
      nextLevel: 2,
      nextRank: "Empty Suit",
      nextLevelRespectRequired: 100,
      respectToNextLevel: 100,
      progressPercent: 0
    });
    vi.mocked(repository.findPlayerItemById).mockResolvedValue({
      id: inventoryItemId,
      playerId,
      itemId: "kevlar-vest",
      equippedSlot: null,
      marketListingId: null,
      acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      createInventoryBalanceServiceMock(),
      repository
    );

    await expect(
      service.equipItem(playerId, inventoryItemId, "armor")
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
      heat: 0,
      heatUpdatedAt: new Date(),
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
      createInventoryBalanceServiceMock(),
      repository
    );
    const result = await service.unequipSlot(playerId, "weapon");

    expect(result?.equippedSlot).toBeNull();
  });

  it("rejects purchases when the player lacks cash", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createInventoryRepositoryMock();
    vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
      level: 1,
      rank: "Scum",
      currentRespect: 0,
      currentLevelMinRespect: 0,
      nextLevel: 2,
      nextRank: "Empty Suit",
      nextLevelRespectRequired: 100,
      respectToNextLevel: 100,
      progressPercent: 0
    });
    vi.mocked(repository.purchaseItem).mockRejectedValue(
      new InsufficientCashForItemError("cheap-pistol")
    );

    const service = new InventoryService(
      playerService,
      createDomainEventsServiceMock(),
      createInventoryBalanceServiceMock(),
      repository
    );

    await expect(service.purchaseItem(playerId, "cheap-pistol")).rejects.toMatchObject(
      {
        status: 400
      }
    );
  });
});
