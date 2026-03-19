import { describe, expect, it, vi } from "vitest";

import { PrismaMissionsRepository } from "./prisma-missions.repository";

describe("PrismaMissionsRepository", () => {
  it("creates a player mission row", async () => {
    const repository = new PrismaMissionsRepository({
      playerMission: {
        create: vi.fn().mockResolvedValue({
          id: crypto.randomUUID(),
          playerId: "player-1",
          missionId: "crime-spree",
          status: "active",
          progress: 0,
          targetProgress: 3,
          acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
          completedAt: null
        })
      }
    } as never);

    const result = await repository.createMission({
      playerId: "player-1",
      missionId: "crime-spree",
      targetProgress: 3,
      acceptedAt: new Date("2026-03-18T10:00:00.000Z")
    });

    expect(result).toMatchObject({
      playerId: "player-1",
      missionId: "crime-spree",
      status: "active",
      progress: 0,
      targetProgress: 3
    });
  });

  it("finds a mission by player and mission id", async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: crypto.randomUUID(),
      playerId: "player-1",
      missionId: "crime-spree",
      status: "active",
      progress: 1,
      targetProgress: 3,
      acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
      completedAt: null
    });
    const repository = new PrismaMissionsRepository({
      playerMission: {
        findUnique
      }
    } as never);

    const result = await repository.findByPlayerAndMissionId("player-1", "crime-spree");

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        playerId_missionId: {
          playerId: "player-1",
          missionId: "crime-spree"
        }
      }
    });
    expect(result?.progress).toBe(1);
  });

  it("updates mission progress", async () => {
    const update = vi.fn().mockResolvedValue({
      id: "mission-1",
      playerId: "player-1",
      missionId: "crime-spree",
      status: "active",
      progress: 3,
      targetProgress: 3,
      acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
      completedAt: null
    });
    const repository = new PrismaMissionsRepository({
      playerMission: {
        update
      }
    } as never);

    const result = await repository.updateProgress("mission-1", 3);

    expect(update).toHaveBeenCalledWith({
      where: {
        id: "mission-1"
      },
      data: {
        progress: 3
      }
    });
    expect(result.progress).toBe(3);
  });

  it("marks a mission completed", async () => {
    const completedAt = new Date("2026-03-18T11:00:00.000Z");
    const repository = new PrismaMissionsRepository({
      playerMission: {
        update: vi.fn().mockResolvedValue({
          id: "mission-1",
          playerId: "player-1",
          missionId: "crime-spree",
          status: "completed",
          progress: 3,
          targetProgress: 3,
          acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
          completedAt
        })
      }
    } as never);

    const result = await repository.markCompleted("mission-1", completedAt);

    expect(result.status).toBe("completed");
    expect(result.completedAt).toEqual(completedAt);
  });
});
