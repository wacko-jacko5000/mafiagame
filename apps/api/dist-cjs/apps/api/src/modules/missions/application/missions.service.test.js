"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const missions_service_1 = require("./missions.service");
function createPlayerServiceMock() {
    return {
        applyResourceDelta: vitest_1.vi.fn(),
        getPlayerById: vitest_1.vi.fn(),
        getPlayerProgression: vitest_1.vi.fn()
    };
}
function createInventoryServiceMock() {
    return {
        listPlayerInventory: vitest_1.vi.fn()
    };
}
function createGangsServiceMock() {
    return {
        getPlayerGangMembership: vitest_1.vi.fn()
    };
}
function createTerritoryServiceMock() {
    return {
        listDistricts: vitest_1.vi.fn()
    };
}
function createMissionsRepositoryMock() {
    return {
        createMission: vitest_1.vi.fn(),
        findByPlayerAndMissionId: vitest_1.vi.fn(),
        listActiveByPlayerId: vitest_1.vi.fn(),
        listByPlayerId: vitest_1.vi.fn(),
        markCompleted: vitest_1.vi.fn(),
        resetMission: vitest_1.vi.fn(),
        updateProgress: vitest_1.vi.fn()
    };
}
function createService(overrides) {
    const playerService = overrides?.playerService ?? createPlayerServiceMock();
    const inventoryService = overrides?.inventoryService ?? createInventoryServiceMock();
    const gangsService = overrides?.gangsService ?? createGangsServiceMock();
    const territoryService = overrides?.territoryService ?? createTerritoryServiceMock();
    const repository = overrides?.repository ?? createMissionsRepositoryMock();
    return {
        playerService,
        inventoryService,
        gangsService,
        territoryService,
        repository,
        service: new missions_service_1.MissionsService(playerService, inventoryService, gangsService, territoryService, repository)
    };
}
(0, vitest_1.describe)("MissionsService", () => {
    (0, vitest_1.it)("lists the full mission progression catalog", () => {
        const { service } = createService();
        (0, vitest_1.expect)(service.listMissions()).toHaveLength(63);
        (0, vitest_1.expect)(service.listMissions()[0]?.id).toBe("level-1-complete-5-crimes");
        (0, vitest_1.expect)(service.listMissions().at(-1)?.id).toBe("level-21-control-3-districts");
    });
    (0, vitest_1.it)("accepts an unlocked mission for the first time", async () => {
        const playerId = crypto.randomUUID();
        const { service, playerService, repository } = createService();
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
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
            id: playerId,
            displayName: "Boss",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.findByPlayerAndMissionId).mockResolvedValue(null);
        vitest_1.vi.mocked(repository.createMission).mockResolvedValue({
            id: crypto.randomUUID(),
            playerId,
            missionId: "level-1-complete-5-crimes",
            status: "active",
            progress: 0,
            targetProgress: 5,
            acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
            completedAt: null
        });
        vitest_1.vi.mocked(repository.updateProgress).mockResolvedValue({
            id: crypto.randomUUID(),
            playerId,
            missionId: "level-1-complete-5-crimes",
            status: "active",
            progress: 0,
            targetProgress: 5,
            acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
            completedAt: null
        });
        const result = await service.acceptMission(playerId, "level-1-complete-5-crimes");
        (0, vitest_1.expect)(result.status).toBe("active");
        (0, vitest_1.expect)(result.targetProgress).toBe(5);
        (0, vitest_1.expect)(result.definition.objectiveType).toBe("crime_count");
    });
    (0, vitest_1.it)("rejects accepting a level-locked mission", async () => {
        const playerId = crypto.randomUUID();
        const { service, playerService } = createService();
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
        await (0, vitest_1.expect)(service.acceptMission(playerId, "level-2-complete-8-crimes")).rejects.toMatchObject({
            status: 400
        });
    });
    (0, vitest_1.it)("increments progress for matching active missions only", async () => {
        const { service, repository } = createService();
        vitest_1.vi.mocked(repository.listActiveByPlayerId).mockResolvedValue([
            {
                id: "mission-1",
                playerId: "player-1",
                missionId: "level-1-complete-5-crimes",
                status: "active",
                progress: 1,
                targetProgress: 5,
                acceptedAt: new Date(),
                completedAt: null
            },
            {
                id: "mission-2",
                playerId: "player-1",
                missionId: "level-3-buy-first-weapon",
                status: "active",
                progress: 0,
                targetProgress: 1,
                acceptedAt: new Date(),
                completedAt: null
            }
        ]);
        vitest_1.vi.mocked(repository.updateProgress).mockResolvedValue({
            id: "mission-1",
            playerId: "player-1",
            missionId: "level-1-complete-5-crimes",
            status: "active",
            progress: 2,
            targetProgress: 5,
            acceptedAt: new Date(),
            completedAt: null
        });
        await service.recordProgress("player-1", "crime_count");
        (0, vitest_1.expect)(repository.updateProgress).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(repository.updateProgress).toHaveBeenCalledWith("mission-1", 2);
    });
    (0, vitest_1.it)("matches contextual item-type progress for buy-item missions", async () => {
        const { service, repository } = createService();
        vitest_1.vi.mocked(repository.listActiveByPlayerId).mockResolvedValue([
            {
                id: "mission-weapon",
                playerId: "player-1",
                missionId: "level-3-buy-first-weapon",
                status: "active",
                progress: 0,
                targetProgress: 1,
                acceptedAt: new Date(),
                completedAt: null
            }
        ]);
        vitest_1.vi.mocked(repository.updateProgress).mockResolvedValue({
            id: "mission-weapon",
            playerId: "player-1",
            missionId: "level-3-buy-first-weapon",
            status: "active",
            progress: 1,
            targetProgress: 1,
            acceptedAt: new Date(),
            completedAt: null
        });
        await service.recordProgress("player-1", "buy_items", 1, {
            itemType: "armor"
        });
        await service.recordProgress("player-1", "buy_items", 1, {
            itemType: "weapon"
        });
        (0, vitest_1.expect)(repository.updateProgress).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(repository.updateProgress).toHaveBeenCalledWith("mission-weapon", 1);
    });
    (0, vitest_1.it)("syncs state-based progress and completes a ready mission", async () => {
        const playerId = crypto.randomUUID();
        const { service, playerService, inventoryService, gangsService, territoryService, repository } = createService();
        const missionRowId = crypto.randomUUID();
        vitest_1.vi.mocked(playerService.getPlayerById).mockResolvedValue({
            id: playerId,
            displayName: "Boss",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(inventoryService.listPlayerInventory).mockResolvedValue([
            {
                id: "owned-weapon",
                playerId,
                itemId: "rusty-knife",
                name: "Rusty Knife",
                type: "weapon",
                category: "handguns",
                price: 100,
                equipSlot: "weapon",
                unlockLevel: 1,
                equippedSlot: "weapon",
                marketListingId: null,
                weaponStats: { damageBonus: 1 },
                armorStats: null,
                acquiredAt: new Date()
            }
        ]);
        vitest_1.vi.mocked(gangsService.getPlayerGangMembership).mockResolvedValue(null);
        vitest_1.vi.mocked(territoryService.listDistricts).mockResolvedValue([]);
        vitest_1.vi.mocked(repository.findByPlayerAndMissionId).mockResolvedValue({
            id: missionRowId,
            playerId,
            missionId: "level-5-equip-weapon",
            status: "active",
            progress: 0,
            targetProgress: 1,
            acceptedAt: new Date("2026-03-18T09:00:00.000Z"),
            completedAt: null
        });
        vitest_1.vi.mocked(repository.updateProgress).mockResolvedValue({
            id: missionRowId,
            playerId,
            missionId: "level-5-equip-weapon",
            status: "active",
            progress: 1,
            targetProgress: 1,
            acceptedAt: new Date("2026-03-18T09:00:00.000Z"),
            completedAt: null
        });
        vitest_1.vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
            id: playerId,
            displayName: "Boss",
            cash: 7000,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        vitest_1.vi.mocked(repository.markCompleted).mockResolvedValue({
            id: missionRowId,
            playerId,
            missionId: "level-5-equip-weapon",
            status: "completed",
            progress: 1,
            targetProgress: 1,
            acceptedAt: new Date("2026-03-18T09:00:00.000Z"),
            completedAt: new Date("2026-03-18T10:00:00.000Z")
        });
        const result = await service.completeMission(playerId, "level-5-equip-weapon");
        (0, vitest_1.expect)(repository.updateProgress).toHaveBeenCalledWith(missionRowId, 1);
        (0, vitest_1.expect)(playerService.applyResourceDelta).toHaveBeenCalledWith(playerId, {
            cash: 4500,
            respect: 0
        });
        (0, vitest_1.expect)(result.mission.status).toBe("completed");
    });
});
