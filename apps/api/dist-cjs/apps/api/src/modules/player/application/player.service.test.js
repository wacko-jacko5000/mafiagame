"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const player_service_1 = require("./player.service");
function createRepositoryMock() {
    return {
        create: vitest_1.vi.fn(),
        applyResourceDelta: vitest_1.vi.fn(),
        updateCustodyStatus: vitest_1.vi.fn(),
        applyCustodyEntry: vitest_1.vi.fn(),
        buyOutCustodyStatus: vitest_1.vi.fn(),
        findByAccountId: vitest_1.vi.fn(),
        findByDisplayName: vitest_1.vi.fn(),
        findById: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("PlayerService", () => {
    (0, vitest_1.it)("creates a player with normalized display name and defaults", async () => {
        const repository = createRepositoryMock();
        vitest_1.vi.mocked(repository.findByDisplayName).mockResolvedValue(null);
        vitest_1.vi.mocked(repository.create).mockResolvedValue({
            id: crypto.randomUUID(),
            accountId: null,
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
        const service = new player_service_1.PlayerService(repository);
        const result = await service.createPlayer({ displayName: "  Don   Luca " });
        (0, vitest_1.expect)(repository.create).toHaveBeenCalledWith({
            accountId: undefined,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100
        });
        (0, vitest_1.expect)(result.displayName).toBe("Don Luca");
    });
    (0, vitest_1.it)("rejects duplicate display names", async () => {
        const repository = createRepositoryMock();
        vitest_1.vi.mocked(repository.findByDisplayName).mockResolvedValue({
            id: crypto.randomUUID(),
            accountId: null,
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
        const service = new player_service_1.PlayerService(repository);
        await (0, vitest_1.expect)(service.createPlayer({ displayName: "Don Luca" })).rejects.toMatchObject({
            status: 409
        });
    });
    (0, vitest_1.it)("returns only resource fields from the player aggregate", async () => {
        const playerId = crypto.randomUUID();
        const repository = createRepositoryMock();
        vitest_1.vi.mocked(repository.findById).mockResolvedValue({
            id: playerId,
            accountId: null,
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
        const service = new player_service_1.PlayerService(repository);
        await (0, vitest_1.expect)(service.getPlayerResources(playerId)).resolves.toEqual({
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100
        });
    });
    (0, vitest_1.it)("derives player progression from respect through the player module", async () => {
        const playerId = crypto.randomUUID();
        const repository = createRepositoryMock();
        vitest_1.vi.mocked(repository.findById).mockResolvedValue({
            id: playerId,
            accountId: null,
            displayName: "Don Luca",
            cash: 2500,
            respect: 900,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new player_service_1.PlayerService(repository);
        await (0, vitest_1.expect)(service.getPlayerProgression(playerId)).resolves.toEqual({
            level: 5,
            rank: "Picciotto",
            currentRespect: 900,
            currentLevelMinRespect: 900,
            nextLevel: 6,
            nextRank: "Shoplifter",
            nextLevelRespectRequired: 1500,
            respectToNextLevel: 600,
            progressPercent: 0
        });
        (0, vitest_1.expect)(service.getRankNameForLevel(21)).toBe("Legendary Don");
    });
    (0, vitest_1.it)("applies a resource delta through the player repository", async () => {
        const playerId = crypto.randomUUID();
        const repository = createRepositoryMock();
        const now = new Date("2026-03-19T19:00:00.000Z");
        vitest_1.vi.mocked(repository.applyResourceDelta).mockResolvedValue({
            id: playerId,
            accountId: null,
            displayName: "Don Luca",
            cash: 2800,
            respect: 1,
            energy: 85,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new player_service_1.PlayerService(repository);
        const result = await service.applyResourceDelta(playerId, {
            cash: 300,
            respect: 1,
            energy: -15
        }, now);
        (0, vitest_1.expect)(repository.applyResourceDelta).toHaveBeenCalledWith(playerId, {
            cash: 300,
            respect: 1,
            energy: -15
        }, now);
        (0, vitest_1.expect)(result.energy).toBe(85);
    });
    (0, vitest_1.it)("reads a player aggregate through the repository at a specific time", async () => {
        const playerId = crypto.randomUUID();
        const now = new Date("2026-03-19T19:05:00.000Z");
        const repository = createRepositoryMock();
        vitest_1.vi.mocked(repository.findById).mockResolvedValue({
            id: playerId,
            accountId: null,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 15,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date("2026-03-19T19:00:00.000Z"),
            updatedAt: new Date("2026-03-19T19:00:00.000Z")
        });
        const service = new player_service_1.PlayerService(repository);
        const player = await service.getPlayerByIdAt(playerId, now);
        (0, vitest_1.expect)(repository.findById).toHaveBeenCalledWith(playerId, now);
        (0, vitest_1.expect)(player.energy).toBe(15);
    });
    (0, vitest_1.it)("updates custody timestamps through the player repository", async () => {
        const playerId = crypto.randomUUID();
        const repository = createRepositoryMock();
        const jailedUntil = new Date("2026-03-16T20:05:00.000Z");
        vitest_1.vi.mocked(repository.updateCustodyStatus).mockResolvedValue({
            id: playerId,
            accountId: null,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const service = new player_service_1.PlayerService(repository);
        const result = await service.updateCustodyStatus(playerId, {
            jailedUntil
        });
        (0, vitest_1.expect)(repository.updateCustodyStatus).toHaveBeenCalledWith(playerId, {
            jailedUntil
        });
        (0, vitest_1.expect)(result.jailedUntil).toEqual(jailedUntil);
    });
    (0, vitest_1.it)("binds a created player to the authenticated account", async () => {
        const repository = createRepositoryMock();
        const accountId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findByDisplayName).mockResolvedValue(null);
        vitest_1.vi.mocked(repository.findByAccountId).mockResolvedValue(null);
        vitest_1.vi.mocked(repository.create).mockResolvedValue({
            id: crypto.randomUUID(),
            accountId,
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
        const service = new player_service_1.PlayerService(repository);
        await service.createPlayerForAccount({ displayName: "Don Luca" }, accountId);
        (0, vitest_1.expect)(repository.findByAccountId).toHaveBeenCalledWith(accountId);
        (0, vitest_1.expect)(repository.create).toHaveBeenCalledWith({
            accountId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100
        });
    });
});
