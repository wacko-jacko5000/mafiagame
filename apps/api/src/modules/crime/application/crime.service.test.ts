import { describe, expect, it, vi } from "vitest";

import { HospitalService } from "../../hospital/application/hospital.service";
import { JailService } from "../../jail/application/jail.service";
import { CrimeService } from "./crime.service";
import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";

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

describe("CrimeService", () => {
  it("lists the starter crimes", () => {
    const service = new CrimeService(
      createPlayerServiceMock(),
      createJailServiceMock(),
      createHospitalServiceMock(),
      createDomainEventsServiceMock(),
      () => 0.5
    );

    expect(service.listCrimes().map((crime) => crime.id)).toEqual([
      "pickpocket",
      "shoplift",
      "steal-bike"
    ]);
  });

  it("executes a successful crime and applies rewards through the player service", async () => {
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
      cash: 2700,
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
      () => 0.3
    );
    const result = await service.executeCrime(crypto.randomUUID(), "pickpocket");

    expect(result.success).toBe(true);
    expect(result.cashAwarded).toBeGreaterThanOrEqual(120);
    expect(playerService.getPlayerByIdAt).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Date)
    );
    expect(playerService.applyResourceDelta).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        energy: -10,
        respect: 1
      }),
      expect.any(Date)
    );
    expect(result.consequence).toEqual({
      type: "none",
      activeUntil: null
    });
  });

  it("returns a jail failure result and still consumes energy", async () => {
    const playerService = createPlayerServiceMock();
    const jailService = createJailServiceMock();
    const hospitalService = createHospitalServiceMock();
    const playerId = crypto.randomUUID();
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
      id: crypto.randomUUID(),
      displayName: "Don Luca",
      cash: 2500,
      respect: 0,
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
      () => 0.9
    );
    const result = await service.executeCrime(playerId, "shoplift");

    expect(result).toEqual({
      crimeId: "shoplift",
      success: false,
      energySpent: 14,
      cashAwarded: 0,
      respectAwarded: 0,
      consequence: {
        type: "jail",
        activeUntil: new Date("2026-03-16T20:05:00.000Z")
      }
    });
    expect(playerService.applyResourceDelta).toHaveBeenCalledWith(
      playerId,
      {
        energy: -14,
        cash: 0,
        respect: 0
      },
      expect.any(Date)
    );
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
      energy: 80,
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
      remainingSeconds: 480
    });

    const service = new CrimeService(
      playerService,
      jailService,
      hospitalService,
      createDomainEventsServiceMock(),
      () => 0.9
    );
    const result = await service.executeCrime(playerId, "steal-bike");

    expect(result.consequence).toEqual({
      type: "hospital",
      activeUntil: new Date("2026-03-16T20:08:00.000Z")
    });
  });

  it("rejects execution when the player lacks energy", async () => {
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
      energy: 5,
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
      () => 0.1
    );

    await expect(
      service.executeCrime(crypto.randomUUID(), "pickpocket")
    ).rejects.toMatchObject({
      status: 400
    });
  });

  it("rejects execution while the player is jailed", async () => {
    const playerId = crypto.randomUUID();
    const service = new CrimeService(
      createPlayerServiceMock(),
      {
        getStatus: vi.fn().mockResolvedValue({
          playerId,
          active: true,
          until: new Date("2026-03-16T20:05:00.000Z"),
          remainingSeconds: 300
        }),
        jailPlayer: vi.fn()
      } as unknown as JailService,
      createHospitalServiceMock(),
      createDomainEventsServiceMock(),
      () => 0.1
    );

    await expect(service.executeCrime(playerId, "pickpocket")).rejects.toMatchObject(
      {
        status: 409
      }
    );
  });

  it("rejects execution while the player is hospitalized", async () => {
    const playerId = crypto.randomUUID();
    const service = new CrimeService(
      createPlayerServiceMock(),
      {
        getStatus: vi.fn().mockResolvedValue({
          playerId,
          active: false,
          until: null,
          remainingSeconds: 0
        }),
        jailPlayer: vi.fn()
      } as unknown as JailService,
      {
        getStatus: vi.fn().mockResolvedValue({
          playerId,
          active: true,
          until: new Date("2026-03-16T20:08:00.000Z"),
          remainingSeconds: 480
        }),
        hospitalizePlayer: vi.fn()
      } as unknown as HospitalService,
      createDomainEventsServiceMock(),
      () => 0.1
    );

    await expect(service.executeCrime(playerId, "pickpocket")).rejects.toMatchObject(
      {
        status: 409
      }
    );
  });

  it("rejects unknown crimes", async () => {
    const service = new CrimeService(
      createPlayerServiceMock(),
      createJailServiceMock(),
      createHospitalServiceMock(),
      createDomainEventsServiceMock(),
      () => 0.1
    );

    await expect(
      service.executeCrime(crypto.randomUUID(), "unknown-crime")
    ).rejects.toMatchObject({
      status: 404
    });
  });

  it("accepts a crime when lazy regeneration restores enough energy by request time", async () => {
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
      energy: 10,
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
      id: playerId,
      displayName: "Don Luca",
      cash: 2700,
      respect: 1,
      energy: 0,
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
      () => 0.3
    );

    await expect(service.executeCrime(playerId, "pickpocket")).resolves.toMatchObject({
      crimeId: "pickpocket",
      success: true
    });
  });
});
