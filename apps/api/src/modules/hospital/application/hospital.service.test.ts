import { describe, expect, it, vi } from "vitest";

import { PlayerService } from "../../player/application/player.service";
import { HospitalService } from "./hospital.service";

function createPlayerServiceMock() {
  return {
    getPlayerById: vi.fn(),
    updateCustodyStatus: vi.fn()
  } as unknown as PlayerService;
}

describe("HospitalService", () => {
  it("returns an active hospital status when the release time is in the future", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: new Date("2026-03-16T20:08:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new HospitalService(playerService);
    const status = await service.getStatus(
      playerId,
      new Date("2026-03-16T20:00:30.000Z")
    );

    expect(status).toMatchObject({
      playerId,
      active: true,
      remainingSeconds: 450
    });
  });

  it("applies hospitalization through the player service", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    vi.mocked(playerService.updateCustodyStatus).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: new Date("2026-03-16T20:08:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new HospitalService(playerService);
    const now = new Date("2026-03-16T20:00:00.000Z");
    const status = await service.hospitalizePlayer(playerId, 480, now);

    expect(playerService.updateCustodyStatus).toHaveBeenCalledWith(playerId, {
      hospitalizedUntil: new Date("2026-03-16T20:08:00.000Z")
    });
    expect(status.until?.toISOString()).toBe("2026-03-16T20:08:00.000Z");
  });

  it("blocks crime execution while the player is hospitalized", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    vi.mocked(playerService.getPlayerById).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: new Date("2026-03-16T20:08:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new HospitalService(playerService);

    await expect(
      service.assertCrimeExecutionAllowed(
        playerId,
        new Date("2026-03-16T20:00:30.000Z")
      )
    ).rejects.toMatchObject({
      status: 409
    });
  });
});
