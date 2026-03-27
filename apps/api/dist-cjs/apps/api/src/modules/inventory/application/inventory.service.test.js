"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const inventory_errors_1 = require("../domain/inventory.errors");
const inventory_service_1 = require("./inventory.service");
function createPlayerServiceMock() {
    return {
        getPlayerById: vitest_1.vi.fn(),
        getPlayerProgression: vitest_1.vi.fn(),
        getRankNameForLevel: vitest_1.vi.fn((level) => {
            const names = {
                1: "Scum",
                2: "Empty Suit",
                21: "Legendary Don"
            };
            return names[level] ?? `Level ${level}`;
        })
    };
}
function createDomainEventsServiceMock() {
    return {
        publish: vitest_1.vi.fn()
    };
}
function createInventoryRepositoryMock() {
    return {
        findPlayerItemById: vitest_1.vi.fn(),
        equipItem: vitest_1.vi.fn(),
        listPlayerItems: vitest_1.vi.fn(),
        purchaseItem: vitest_1.vi.fn(),
        unequipSlot: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("InventoryService", () => {
    (0, vitest_1.it)("lists the starter shop catalog", () => {
        const playerService = createPlayerServiceMock();
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), createInventoryRepositoryMock());
        (0, vitest_1.expect)(service.listShopItems().slice(0, 3)).toEqual([
            vitest_1.expect.objectContaining({
                id: "rusty-knife",
                name: "Glock 17",
                category: "handguns",
                unlockLevel: 1,
                unlockRank: "Scum"
            }),
            vitest_1.expect.objectContaining({
                id: "cheap-pistol",
                name: "Colt M1911",
                category: "handguns",
                unlockLevel: 1,
                unlockRank: "Scum"
            }),
            vitest_1.expect.objectContaining({
                id: "beretta-92fs",
                unlockLevel: 2,
                unlockRank: "Empty Suit"
            })
        ]);
        (0, vitest_1.expect)(service.listShopItems().map((item) => item.id)).toContain("leather-jacket");
    });
    (0, vitest_1.it)("projects lock state for the current player's shop view", async () => {
        const playerService = createPlayerServiceMock();
        vitest_1.vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
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
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), createInventoryRepositoryMock());
        const result = await service.listShopItemsForPlayer(crypto.randomUUID());
        (0, vitest_1.expect)(result.find((item) => item.id === "rusty-knife")).toMatchObject({
            isUnlocked: true,
            isLocked: false
        });
        (0, vitest_1.expect)(result.find((item) => item.id === "beretta-92fs")).toMatchObject({
            unlockLevel: 2,
            unlockRank: "Empty Suit",
            isUnlocked: false,
            isLocked: true
        });
    });
    (0, vitest_1.it)("lists a player's owned inventory", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createInventoryRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
        vitest_1.vi.mocked(repository.listPlayerItems).mockResolvedValue([
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
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.listPlayerInventory(playerId);
        (0, vitest_1.expect)(result[0]).toMatchObject({
            itemId: "rusty-knife",
            name: "Glock 17"
        });
    });
    (0, vitest_1.it)("purchases an item when the player has enough cash", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createInventoryRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
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
        vitest_1.vi.mocked(repository.purchaseItem).mockResolvedValue({
            playerCashAfterPurchase: 2100,
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
            }
        });
        const domainEventsService = createDomainEventsServiceMock();
        const service = new inventory_service_1.InventoryService(playerService, domainEventsService, repository);
        const result = await service.purchaseItem(playerId, "rusty-knife");
        (0, vitest_1.expect)(repository.purchaseItem).toHaveBeenCalledWith({
            playerId,
            item: vitest_1.expect.objectContaining({
                id: "rusty-knife",
                price: 400
            })
        });
        (0, vitest_1.expect)(result.playerCashAfterPurchase).toBe(2100);
        (0, vitest_1.expect)(domainEventsService.publish).toHaveBeenCalledWith({
            type: "inventory.item_purchased",
            occurredAt: vitest_1.expect.any(Date),
            playerId,
            inventoryItemId: "owned-1",
            itemId: "rusty-knife",
            price: 400
        });
    });
    (0, vitest_1.it)("rejects purchases when the player's level is too low", async () => {
        const playerService = createPlayerServiceMock();
        vitest_1.vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
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
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), repository);
        await (0, vitest_1.expect)(service.purchaseItem(crypto.randomUUID(), "beretta-92fs")).rejects.toMatchObject({
            status: 400
        });
        (0, vitest_1.expect)(repository.purchaseItem).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("rejects unknown shop items", async () => {
        const service = new inventory_service_1.InventoryService(createPlayerServiceMock(), createDomainEventsServiceMock(), createInventoryRepositoryMock());
        await (0, vitest_1.expect)(service.purchaseItem(crypto.randomUUID(), "unknown-item")).rejects.toMatchObject({
            status: 404
        });
    });
    (0, vitest_1.it)("lists currently equipped items for a player", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createInventoryRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
        vitest_1.vi.mocked(repository.listPlayerItems).mockResolvedValue([
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
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.getEquippedItems(playerId);
        (0, vitest_1.expect)(result.weapon?.itemId).toBe("rusty-knife");
        (0, vitest_1.expect)(result.armor).toBeNull();
    });
    (0, vitest_1.it)("equips an owned item into a valid slot", async () => {
        const playerId = crypto.randomUUID();
        const inventoryItemId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createInventoryRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
        vitest_1.vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
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
        vitest_1.vi.mocked(repository.findPlayerItemById).mockResolvedValue({
            id: inventoryItemId,
            playerId,
            itemId: "rusty-knife",
            equippedSlot: null,
            marketListingId: null,
            acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.equipItem).mockResolvedValue({
            id: inventoryItemId,
            playerId,
            itemId: "rusty-knife",
            equippedSlot: "weapon",
            marketListingId: null,
            acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.equipItem(playerId, inventoryItemId, "weapon");
        (0, vitest_1.expect)(repository.equipItem).toHaveBeenCalledWith({
            playerId,
            inventoryItemId,
            slot: "weapon"
        });
        (0, vitest_1.expect)(result.equippedSlot).toBe("weapon");
    });
    (0, vitest_1.it)("rejects invalid slot and item combinations", async () => {
        const playerId = crypto.randomUUID();
        const inventoryItemId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createInventoryRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
        vitest_1.vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
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
        vitest_1.vi.mocked(repository.findPlayerItemById).mockResolvedValue({
            id: inventoryItemId,
            playerId,
            itemId: "leather-jacket",
            equippedSlot: null,
            marketListingId: null,
            acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), repository);
        await (0, vitest_1.expect)(service.equipItem(playerId, inventoryItemId, "weapon")).rejects.toMatchObject({
            status: 400
        });
    });
    (0, vitest_1.it)("rejects equipping an item that is listed for sale", async () => {
        const playerId = crypto.randomUUID();
        const inventoryItemId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createInventoryRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
        vitest_1.vi.mocked(repository.findPlayerItemById).mockResolvedValue({
            id: inventoryItemId,
            playerId,
            itemId: "rusty-knife",
            equippedSlot: null,
            marketListingId: crypto.randomUUID(),
            acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), repository);
        await (0, vitest_1.expect)(service.equipItem(playerId, inventoryItemId, "weapon")).rejects.toMatchObject({
            status: 400
        });
        (0, vitest_1.expect)(repository.equipItem).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("rejects equipping an item when the player's level is too low", async () => {
        const playerId = crypto.randomUUID();
        const inventoryItemId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createInventoryRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
        vitest_1.vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
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
        vitest_1.vi.mocked(repository.findPlayerItemById).mockResolvedValue({
            id: inventoryItemId,
            playerId,
            itemId: "kevlar-vest",
            equippedSlot: null,
            marketListingId: null,
            acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), repository);
        await (0, vitest_1.expect)(service.equipItem(playerId, inventoryItemId, "armor")).rejects.toMatchObject({
            status: 400
        });
        (0, vitest_1.expect)(repository.equipItem).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("unequips a slot", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createInventoryRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
        vitest_1.vi.mocked(repository.unequipSlot).mockResolvedValue({
            id: crypto.randomUUID(),
            playerId,
            itemId: "rusty-knife",
            equippedSlot: null,
            marketListingId: null,
            acquiredAt: new Date("2026-03-16T20:00:00.000Z"),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), repository);
        const result = await service.unequipSlot(playerId, "weapon");
        (0, vitest_1.expect)(result?.equippedSlot).toBeNull();
    });
    (0, vitest_1.it)("rejects purchases when the player lacks cash", async () => {
        const playerId = crypto.randomUUID();
        const playerService = createPlayerServiceMock();
        const repository = createInventoryRepositoryMock();
        vitest_1.vi.mocked(playerService.getPlayerProgression).mockResolvedValue({
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
        vitest_1.vi.mocked(repository.purchaseItem).mockRejectedValue(new inventory_errors_1.InsufficientCashForItemError("cheap-pistol"));
        const service = new inventory_service_1.InventoryService(playerService, createDomainEventsServiceMock(), repository);
        await (0, vitest_1.expect)(service.purchaseItem(playerId, "cheap-pistol")).rejects.toMatchObject({
            status: 400
        });
    });
});
