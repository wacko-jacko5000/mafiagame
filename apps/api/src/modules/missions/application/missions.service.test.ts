import { describe, expect, it, vi } from "vitest";

import { PlayerService } from "../../player/application/player.service";
import { MissionsService } from "./missions.service";
import type { MissionsRepository } from "./missions.repository";

function createPlayerServiceMock() {
  return {
    applyResourceDelta: vi.fn(),
    getPlayerById: vi.fn()
  } as unknown as PlayerService;
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

describe("MissionsService", () => {
  it("lists the starter mission catalog", () => {
    const service = new MissionsService(
      createPlayerServiceMock(),
      createMissionsRepositoryMock()
    );

    expect(service.listMissions().map((mission) => mission.id)).toEqual([
      "crime-spree",
      "supply-run",
      "street-finisher",
      "first-claim"
    ]);
  });

  it("accepts a mission for the first time", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createMissionsRepositoryMock();

    vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
    vi.mocked(repository.findByPlayerAndMissionId).mockResolvedValue(null);
    vi.mocked(repository.createMission).mockResolvedValue({
      id: crypto.randomUUID(),
      playerId,
      missionId: "crime-spree",
      status: "active",
      progress: 0,
      targetProgress: 3,
      acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
      completedAt: null
    });

    const service = new MissionsService(playerService, repository);
    const result = await service.acceptMission(playerId, "crime-spree");

    expect(result.status).toBe("active");
    expect(result.targetProgress).toBe(3);
    expect(result.definition.objectiveType).toBe("commit_crime_n_times");
  });

  it("allows repeatable missions to be accepted again after completion", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createMissionsRepositoryMock();

    vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
    vi.mocked(repository.findByPlayerAndMissionId).mockResolvedValue({
      id: crypto.randomUUID(),
      playerId,
      missionId: "crime-spree",
      status: "completed",
      progress: 3,
      targetProgress: 3,
      acceptedAt: new Date("2026-03-18T09:00:00.000Z"),
      completedAt: new Date("2026-03-18T09:30:00.000Z")
    });
    vi.mocked(repository.resetMission).mockResolvedValue({
      id: crypto.randomUUID(),
      playerId,
      missionId: "crime-spree",
      status: "active",
      progress: 0,
      targetProgress: 3,
      acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
      completedAt: null
    });

    const service = new MissionsService(playerService, repository);
    const result = await service.acceptMission(playerId, "crime-spree");

    expect(result.status).toBe("active");
    expect(result.progress).toBe(0);
  });

  it("rejects re-accepting a completed one-off mission", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createMissionsRepositoryMock();

    vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
    vi.mocked(repository.findByPlayerAndMissionId).mockResolvedValue({
      id: crypto.randomUUID(),
      playerId,
      missionId: "first-claim",
      status: "completed",
      progress: 1,
      targetProgress: 1,
      acceptedAt: new Date("2026-03-18T09:00:00.000Z"),
      completedAt: new Date("2026-03-18T09:30:00.000Z")
    });

    const service = new MissionsService(playerService, repository);

    await expect(service.acceptMission(playerId, "first-claim")).rejects.toMatchObject({
      status: 409
    });
  });

  it("increments progress for matching active missions only", async () => {
    const repository = createMissionsRepositoryMock();
    vi.mocked(repository.listActiveByPlayerId).mockResolvedValue([
      {
        id: "mission-1",
        playerId: "player-1",
        missionId: "crime-spree",
        status: "active",
        progress: 1,
        targetProgress: 3,
        acceptedAt: new Date(),
        completedAt: null
      },
      {
        id: "mission-2",
        playerId: "player-1",
        missionId: "supply-run",
        status: "active",
        progress: 1,
        targetProgress: 2,
        acceptedAt: new Date(),
        completedAt: null
      }
    ]);
    vi.mocked(repository.updateProgress).mockResolvedValue({
      id: "mission-1",
      playerId: "player-1",
      missionId: "crime-spree",
      status: "active",
      progress: 2,
      targetProgress: 3,
      acceptedAt: new Date(),
      completedAt: null
    });

    const service = new MissionsService(createPlayerServiceMock(), repository);

    await service.recordProgress("player-1", "commit_crime_n_times");

    expect(repository.updateProgress).toHaveBeenCalledTimes(1);
    expect(repository.updateProgress).toHaveBeenCalledWith("mission-1", 2);
  });

  it("completes a ready mission and grants rewards through player service", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createMissionsRepositoryMock();
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
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.findByPlayerAndMissionId).mockResolvedValue({
      id: missionRowId,
      playerId,
      missionId: "crime-spree",
      status: "active",
      progress: 3,
      targetProgress: 3,
      acceptedAt: new Date("2026-03-18T09:00:00.000Z"),
      completedAt: null
    });
    vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
      id: playerId,
      displayName: "Boss",
      cash: 2800,
      respect: 1,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(repository.markCompleted).mockResolvedValue({
      id: missionRowId,
      playerId,
      missionId: "crime-spree",
      status: "completed",
      progress: 3,
      targetProgress: 3,
      acceptedAt: new Date("2026-03-18T09:00:00.000Z"),
      completedAt: new Date("2026-03-18T10:00:00.000Z")
    });

    const service = new MissionsService(playerService, repository);
    const result = await service.completeMission(playerId, "crime-spree");

    expect(playerService.applyResourceDelta).toHaveBeenCalledWith(playerId, {
      cash: 300,
      respect: 1
    });
    expect(repository.markCompleted).toHaveBeenCalledWith(
      missionRowId,
      expect.any(Date)
    );
    expect(result.mission.status).toBe("completed");
    expect(result.playerResources.cash).toBe(2800);
  });

  it("rejects mission completion before progress reaches the target", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const repository = createMissionsRepositoryMock();

    vi.mocked(playerService.getPlayerById).mockResolvedValue({
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
    vi.mocked(repository.findByPlayerAndMissionId).mockResolvedValue({
      id: crypto.randomUUID(),
      playerId,
      missionId: "crime-spree",
      status: "active",
      progress: 2,
      targetProgress: 3,
      acceptedAt: new Date(),
      completedAt: null
    });

    const service = new MissionsService(playerService, repository);

    await expect(service.completeMission(playerId, "crime-spree")).rejects.toMatchObject({
      status: 409
    });
    expect(playerService.applyResourceDelta).not.toHaveBeenCalled();
  });
});
