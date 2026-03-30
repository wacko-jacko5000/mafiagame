import { describe, expect, it, vi } from "vitest";

import { CustodyBalanceService } from "../../custody/application/custody-balance.service";
import { PlayerActivityService } from "../../notifications/application/player-activity.service";
import { PlayerService } from "../../player/application/player.service";
import { JailService } from "./jail.service";

function createPlayerServiceMock() {
  return {
    getPlayerByIdAt: vi.fn(),
    applyCustodyEntry: vi.fn(),
    buyOutCustodyStatus: vi.fn()
  } as unknown as PlayerService;
}

function createCustodyBalanceServiceMock() {
  return {
    buildQuote: vi.fn()
  } as unknown as CustodyBalanceService;
}

function createPlayerActivityServiceMock() {
  return {
    createActivity: vi.fn()
  } as unknown as PlayerActivityService;
}

describe("JailService", () => {
  it("returns an active jail status when the release time is in the future", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: new Date("2026-03-16T20:05:00.000Z"),
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const custodyBalanceService = createCustodyBalanceServiceMock();
    const playerActivityService = createPlayerActivityServiceMock();

    const service = new JailService(
      custodyBalanceService,
      playerActivityService,
      playerService
    );
    const status = await service.getStatus(
      playerId,
      new Date("2026-03-16T20:00:30.000Z")
    );

    expect(status).toMatchObject({
      playerId,
      active: true,
      remainingSeconds: 270
    });
  });

  it("applies a jail sentence through the player service", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    vi.mocked(playerService.applyCustodyEntry).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: new Date("2026-03-16T20:05:00.000Z"),
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const custodyBalanceService = createCustodyBalanceServiceMock();
    const playerActivityService = createPlayerActivityServiceMock();

    const service = new JailService(
      custodyBalanceService,
      playerActivityService,
      playerService
    );
    const now = new Date("2026-03-16T20:00:00.000Z");
    const status = await service.jailPlayer(playerId, 300, null, now);

    expect(playerService.applyCustodyEntry).toHaveBeenCalledWith(playerId, {
      statusType: "jail",
      until: new Date("2026-03-16T20:05:00.000Z"),
      reason: null
    });
    expect(status.until?.toISOString()).toBe("2026-03-16T20:05:00.000Z");
  });

  it("blocks crime execution while the player is jailed", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 100,
      health: 100,
      jailedUntil: new Date("2026-03-16T20:05:00.000Z"),
      hospitalizedUntil: null,
      heat: 0,
      heatUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const custodyBalanceService = createCustodyBalanceServiceMock();
    const playerActivityService = createPlayerActivityServiceMock();

    const service = new JailService(
      custodyBalanceService,
      playerActivityService,
      playerService
    );

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
