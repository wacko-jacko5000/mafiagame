import { describe, expect, it, vi } from "vitest";

import { GangsService } from "../../gangs/application/gangs.service";
import { InventoryService } from "../../inventory/application/inventory.service";
import { PlayerService } from "../../player/application/player.service";
import { TerritoryService } from "../../territory/application/territory.service";
import { MissionsService } from "./missions.service";
import type { MissionsRepository } from "./missions.repository";

function createPlayerServiceMock() {
  return {
    applyResourceDelta: vi.fn(),
    getPlayerById: vi.fn(),
    getPlayerProgression: vi.fn()
  } as unknown as PlayerService;
}

function createInventoryServiceMock() {
  return {
    listPlayerInventory: vi.fn()
  } as unknown as InventoryService;
}

function createGangsServiceMock() {
  return {
    getPlayerGangMembership: vi.fn()
  } as unknown as GangsService;
}

function createTerritoryServiceMock() {
  return {
    listDistricts: vi.fn()
  } as unknown as TerritoryService;
}

function createMissionsRepositoryMock(): MissionsRepository {
  return {
    createMission: vi.fn(),
    findByPlayerAndMissionId: vi.fn(),
    listActiveByPlayerId: vi.fn(),
    listByPlayerId: vi.fn(),
    markCompleted: vi.fn(),
    resetMission: vi.fn(),
    updateProgress: vi.fn()
  };
}

function createService(overrides?: {
  playerService?: PlayerService;
  inventoryService?: InventoryService;
  gangsService?: GangsService;
  territoryService?: TerritoryService;
  repository?: MissionsRepository;
}) {
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
    service: new MissionsService(
      playerService,
      inventoryService,
      gangsService,
      territoryService,
      repository
    )
  };
}

describe("MissionsService", () => {
  it("lists the full mission progression catalog", () => {
    const { service } = createService();

    expect(service.listMissions()).toHaveLength(63);
    expect(service.listMissions()[0]?.id).toBe("level-1-complete-5-crimes");
    expect(service.listMissions().at(-1)?.id).toBe("level-21-control-3-districts");
  });

  it("accepts an unlocked mission for the first time", async () => {
    const playerId = crypto.randomUUID();
    const { service, playerService, repository } = createService();

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
      displayName: "Boss",
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
    vi.mocked(repository.findByPlayerAndMissionId).mockResolvedValue(null);
    vi.mocked(repository.createMission).mockResolvedValue({
      id: crypto.randomUUID(),
      playerId,
      missionId: "level-1-complete-5-crimes",
      status: "active",
      progress: 0,
      targetProgress: 5,
      acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
      completedAt: null
    });
    vi.mocked(repository.updateProgress).mockResolvedValue({
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

    expect(result.status).toBe("active");
    expect(result.targetProgress).toBe(5);
    expect(result.definition.objectiveType).toBe("crime_count");
  });

  it("rejects accepting a level-locked mission", async () => {
    const playerId = crypto.randomUUID();
    const { service, playerService } = createService();

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

    await expect(
      service.acceptMission(playerId, "level-2-complete-8-crimes")
    ).rejects.toMatchObject({
      status: 400
    });
  });

  it("increments progress for matching active missions only", async () => {
    const { service, repository } = createService();

    vi.mocked(repository.listActiveByPlayerId).mockResolvedValue([
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
    vi.mocked(repository.updateProgress).mockResolvedValue({
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

    expect(repository.updateProgress).toHaveBeenCalledTimes(1);
    expect(repository.updateProgress).toHaveBeenCalledWith("mission-1", 2);
  });

  it("matches contextual item-type progress for buy-item missions", async () => {
    const { service, repository } = createService();

    vi.mocked(repository.listActiveByPlayerId).mockResolvedValue([
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
    vi.mocked(repository.updateProgress).mockResolvedValue({
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

    expect(repository.updateProgress).toHaveBeenCalledTimes(1);
    expect(repository.updateProgress).toHaveBeenCalledWith("mission-weapon", 1);
  });

  it("syncs state-based progress and completes a ready mission", async () => {
    const playerId = crypto.randomUUID();
    const { service, playerService, inventoryService, gangsService, territoryService, repository } =
      createService();
    const missionRowId = crypto.randomUUID();

    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Boss",
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
    vi.mocked(inventoryService.listPlayerInventory).mockResolvedValue([
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
    vi.mocked(gangsService.getPlayerGangMembership).mockResolvedValue(null);
    vi.mocked(territoryService.listDistricts).mockResolvedValue([]);
    vi.mocked(repository.findByPlayerAndMissionId).mockResolvedValue({
      id: missionRowId,
      playerId,
      missionId: "level-5-equip-weapon",
      status: "active",
      progress: 0,
      targetProgress: 1,
      acceptedAt: new Date("2026-03-18T09:00:00.000Z"),
      completedAt: null
    });
    vi.mocked(repository.updateProgress).mockResolvedValue({
      id: missionRowId,
      playerId,
      missionId: "level-5-equip-weapon",
      status: "active",
      progress: 1,
      targetProgress: 1,
      acceptedAt: new Date("2026-03-18T09:00:00.000Z"),
      completedAt: null
    });
    vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
      id: playerId,
      displayName: "Boss",
      cash: 7000,
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
    vi.mocked(repository.markCompleted).mockResolvedValue({
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

    expect(repository.updateProgress).toHaveBeenCalledWith(missionRowId, 1);
    expect(playerService.applyResourceDelta).toHaveBeenCalledWith(playerId, {
      cash: 4500,
      respect: 0
    });
    expect(result.mission.status).toBe("completed");
  });
});
