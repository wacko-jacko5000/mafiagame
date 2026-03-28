import { describe, expect, it, vi } from "vitest";

import { HospitalService } from "../../hospital/application/hospital.service";
import { JailService } from "../../jail/application/jail.service";
import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { getCrimeById, starterCrimeCatalog } from "../domain/crime.catalog";
import { CrimeBalanceService } from "./crime-balance.service";
import { CrimeService } from "./crime.service";

function createPlayerServiceMock() {
  return {
    getPlayerById: vi.fn(),
    getPlayerByIdAt: vi.fn(),
    applyResourceDelta: vi.fn()
  } as unknown as PlayerService;
}

function createJailServiceMock() {
  return {
    getStatus: vi.fn(),
    jailPlayer: vi.fn()
  } as unknown as JailService;
}

function createHospitalServiceMock() {
  return {
    getStatus: vi.fn(),
    hospitalizePlayer: vi.fn()
  } as unknown as HospitalService;
}

function createDomainEventsServiceMock() {
  return {
    publish: vi.fn()
  } as unknown as DomainEventsService;
}

function createCrimeBalanceServiceMock() {
  return {
    listCrimeBalances: vi.fn(() => starterCrimeCatalog),
    findCrimeById: vi.fn((crimeId: string) => getCrimeById(crimeId) ?? null)
  } as unknown as CrimeBalanceService;
}

describe("CrimeService", () => {
  it("lists the full crime progression catalog", () => {
    const service = new CrimeService(
      createPlayerServiceMock(),
      createJailServiceMock(),
      createHospitalServiceMock(),
      createDomainEventsServiceMock(),
      createCrimeBalanceServiceMock(),
      () => 0.5
    );

    expect(service.listCrimes()).toHaveLength(84);
    expect(service.listCrimes()[0]?.id).toBe("pickpocket");
    expect(service.listCrimes().at(-1)?.id).toBe("ultimate-power-play");
  });

  it("executes a successful unlocked crime and applies rewards through the player service", async () => {
    const playerService = createPlayerServiceMock();
    const jailService = createJailServiceMock();
    const hospitalService = createHospitalServiceMock();
    vi.mocked(jailService.getStatus).mockResolvedValue({
      playerId: crypto.randomUUID(),
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(hospitalService.getStatus).mockResolvedValue({
      playerId: crypto.randomUUID(),
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
      id: crypto.randomUUID(),
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
    vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
      id: crypto.randomUUID(),
      displayName: "Don Luca",
      cash: 2600,
      respect: 1,
      energy: 90,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const service = new CrimeService(
      playerService,
      jailService,
      hospitalService,
      createDomainEventsServiceMock(),
      createCrimeBalanceServiceMock(),
      () => 0.3
    );
    const result = await service.executeCrime(crypto.randomUUID(), "pickpocket");

    expect(result.success).toBe(true);
    expect(result.cashAwarded).toBeGreaterThanOrEqual(50);
    expect(playerService.applyResourceDelta).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        energy: -10,
        respect: 1
      }),
      expect.any(Date)
    );
  });

  it("rejects execution for level-locked crimes", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const jailService = createJailServiceMock();
    const hospitalService = createHospitalServiceMock();

    vi.mocked(jailService.getStatus).mockResolvedValue({
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(hospitalService.getStatus).mockResolvedValue({
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
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

    const service = new CrimeService(
      playerService,
      jailService,
      hospitalService,
      createDomainEventsServiceMock(),
      createCrimeBalanceServiceMock(),
      () => 0.3
    );

    await expect(service.executeCrime(playerId, "steal-phone")).rejects.toMatchObject({
      status: 400
    });
  });

  it("returns a jail failure result and still consumes energy", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const jailService = createJailServiceMock();
    const hospitalService = createHospitalServiceMock();

    vi.mocked(jailService.getStatus).mockResolvedValue({
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(hospitalService.getStatus).mockResolvedValue({
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 100,
      energy: 100,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 100,
      energy: 86,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(jailService.jailPlayer).mockResolvedValue({
      playerId,
      active: true,
      until: new Date("2026-03-16T20:05:00.000Z"),
      remainingSeconds: 300
    });

    const service = new CrimeService(
      playerService,
      jailService,
      hospitalService,
      createDomainEventsServiceMock(),
      createCrimeBalanceServiceMock(),
      () => 0.9
    );
    const result = await service.executeCrime(playerId, "shoplift-candy");

    expect(result).toEqual({
      crimeId: "shoplift-candy",
      success: false,
      energySpent: 14,
      cashAwarded: 0,
      respectAwarded: 0,
      consequence: {
        type: "jail",
        activeUntil: new Date("2026-03-16T20:05:00.000Z")
      }
    });
  });

  it("returns a hospital failure result when the crime consequence says hospital", async () => {
    const playerId = crypto.randomUUID();
    const playerService = createPlayerServiceMock();
    const jailService = createJailServiceMock();
    const hospitalService = createHospitalServiceMock();

    vi.mocked(jailService.getStatus).mockResolvedValue({
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(hospitalService.getStatus).mockResolvedValue({
      playerId,
      active: false,
      until: null,
      remainingSeconds: 0
    });
    vi.mocked(playerService.getPlayerByIdAt).mockResolvedValue({
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
    vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
      energy: 78,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(hospitalService.hospitalizePlayer).mockResolvedValue({
      playerId,
      active: true,
      until: new Date("2026-03-16T20:08:00.000Z"),
      remainingSeconds: 900
    });

    const service = new CrimeService(
      playerService,
      jailService,
      hospitalService,
      createDomainEventsServiceMock(),
      createCrimeBalanceServiceMock(),
      () => 0.9
    );
    const result = await service.executeCrime(playerId, "mug-civilian");

    expect(result.consequence).toEqual({
      type: "hospital",
      activeUntil: new Date("2026-03-16T20:08:00.000Z")
    });
  });
});
