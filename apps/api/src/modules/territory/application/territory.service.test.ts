import { describe, expect, it, vi } from "vitest";

import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { GangsService } from "../../gangs/application/gangs.service";
import { PlayerService } from "../../player/application/player.service";
import type { TerritoryRepository } from "./territory.repository";
import { TerritoryService } from "./territory.service";

function createPlayerServiceMock() {
  return {
    applyResourceDelta: vi.fn()
  } as unknown as PlayerService;
}

function createGangsServiceMock() {
  return {
    assertPlayerIsGangLeader: vi.fn(),
    getGangById: vi.fn()
  } as unknown as GangsService;
}

function createDomainEventsServiceMock() {
  return {
    publish: vi.fn()
  } as unknown as DomainEventsService;
}

function createTerritoryRepositoryMock(): TerritoryRepository {
  return {
    claimDistrict: vi.fn(),
    claimDistrictPayout: vi.fn(),
    findActiveWarByDistrictId: vi.fn(),
    findDistrictById: vi.fn(),
    findWarById: vi.fn(),
    listDistricts: vi.fn(),
    updateDistrictBalance: vi.fn(),
    resolveWar: vi.fn(),
    startWar: vi.fn()
  };
}

describe("TerritoryService", () => {
  it("lists districts with payout and controller data", async () => {
    const playerService = createPlayerServiceMock();
    const gangsService = createGangsServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createTerritoryRepositoryMock();
    const districtId = crypto.randomUUID();
    const gangId = crypto.randomUUID();

    vi.mocked(repository.listDistricts).mockResolvedValue([
      {
        id: districtId,
        name: "Downtown",
        payoutAmount: 1000,
        payoutCooldownMinutes: 60,
        createdAt: new Date("2026-03-17T00:05:00.000Z"),
        control: {
          id: crypto.randomUUID(),
          districtId,
          gangId,
          capturedAt: new Date("2026-03-17T00:10:00.000Z"),
          lastPayoutClaimedAt: new Date("2026-03-17T01:10:00.000Z")
        },
        activeWar: null
      }
    ]);
    vi.mocked(gangsService.getGangById).mockResolvedValue({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date("2026-03-16T22:00:00.000Z"),
      createdByPlayerId: crypto.randomUUID(),
      memberCount: 2
    });

    const service = new TerritoryService(
      playerService,
      gangsService,
      domainEventsService,
      repository
    );
    const result = await service.listDistricts();

    expect(result).toEqual([
      {
        id: districtId,
        name: "Downtown",
        payout: {
          amount: 1000,
          cooldownMinutes: 60,
          lastClaimedAt: new Date("2026-03-17T01:10:00.000Z"),
          nextClaimAvailableAt: new Date("2026-03-17T02:10:00.000Z")
        },
        createdAt: new Date("2026-03-17T00:05:00.000Z"),
        controller: {
          gangId,
          gangName: "Night Owls",
          capturedAt: new Date("2026-03-17T00:10:00.000Z")
        },
        activeWar: null
      }
    ]);
  });

  it("returns a single district by id with payout data", async () => {
    const playerService = createPlayerServiceMock();
    const gangsService = createGangsServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createTerritoryRepositoryMock();
    const districtId = crypto.randomUUID();

    vi.mocked(repository.findDistrictById).mockResolvedValue({
      id: districtId,
      name: "Little Italy",
      payoutAmount: 1000,
      payoutCooldownMinutes: 60,
      createdAt: new Date("2026-03-17T00:05:00.000Z"),
      control: null,
      activeWar: null
    });

    const service = new TerritoryService(
      playerService,
      gangsService,
      domainEventsService,
      repository
    );
    const result = await service.getDistrictById(districtId);

    expect(result.controller).toBeNull();
    expect(result.activeWar).toBeNull();
    expect(result.payout).toEqual({
      amount: 1000,
      cooldownMinutes: 60,
      lastClaimedAt: null,
      nextClaimAvailableAt: null
    });
  });

  it("claims an unclaimed district for a gang only when the player is authorized", async () => {
    const playerService = createPlayerServiceMock();
    const gangsService = createGangsServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createTerritoryRepositoryMock();
    const districtId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    const capturedAt = new Date("2026-03-17T00:10:00.000Z");

    vi.mocked(gangsService.assertPlayerIsGangLeader).mockResolvedValue();
    vi.mocked(gangsService.getGangById).mockResolvedValue({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date("2026-03-16T22:00:00.000Z"),
      createdByPlayerId: playerId,
      memberCount: 2
    });
    vi.mocked(repository.claimDistrict).mockResolvedValue({
      id: crypto.randomUUID(),
      districtId,
      gangId,
      capturedAt,
      lastPayoutClaimedAt: null
    });
    vi.mocked(repository.findDistrictById)
      .mockResolvedValueOnce({
        id: districtId,
        name: "Downtown",
        payoutAmount: 1000,
        payoutCooldownMinutes: 60,
        createdAt: new Date("2026-03-17T00:05:00.000Z"),
        control: null,
        activeWar: null
      })
      .mockResolvedValueOnce({
        id: districtId,
        name: "Downtown",
        payoutAmount: 1000,
        payoutCooldownMinutes: 60,
        createdAt: new Date("2026-03-17T00:05:00.000Z"),
        control: {
          id: crypto.randomUUID(),
          districtId,
          gangId,
          capturedAt,
          lastPayoutClaimedAt: null
        },
        activeWar: null
      });

    const service = new TerritoryService(
      playerService,
      gangsService,
      domainEventsService,
      repository
    );
    const result = await service.claimDistrict({
      districtId,
      gangId,
      playerId
    });

    expect(gangsService.assertPlayerIsGangLeader).toHaveBeenCalledWith(gangId, playerId);
    expect(repository.claimDistrict).toHaveBeenCalledWith({
      districtId,
      gangId
    });
    expect(domainEventsService.publish).toHaveBeenCalledWith({
      type: "territory.district_claimed",
      occurredAt: expect.any(Date),
      playerId,
      gangId,
      districtId
    });
    expect(result.controller?.gangId).toBe(gangId);
  });

  it("rejects unauthorized district claims", async () => {
    const playerService = createPlayerServiceMock();
    const gangsService = createGangsServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createTerritoryRepositoryMock();

    vi.mocked(gangsService.assertPlayerIsGangLeader).mockRejectedValue({
      status: 409
    });

    const service = new TerritoryService(
      playerService,
      gangsService,
      domainEventsService,
      repository
    );

    await expect(
      service.claimDistrict({
        districtId: crypto.randomUUID(),
        gangId: crypto.randomUUID(),
        playerId: crypto.randomUUID()
      })
    ).rejects.toMatchObject({
      status: 409
    });
  });

  it("claims a district payout for the controlling gang leader and credits the player", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-17T03:00:00.000Z"));

    const playerService = createPlayerServiceMock();
    const gangsService = createGangsServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createTerritoryRepositoryMock();
    const districtId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerId = crypto.randomUUID();

    vi.mocked(gangsService.assertPlayerIsGangLeader).mockResolvedValue();
    vi.mocked(gangsService.getGangById).mockResolvedValue({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date("2026-03-16T22:00:00.000Z"),
      createdByPlayerId: playerId,
      memberCount: 2
    });
    vi.mocked(repository.findDistrictById)
      .mockResolvedValueOnce({
        id: districtId,
        name: "Downtown",
        payoutAmount: 1000,
        payoutCooldownMinutes: 60,
        createdAt: new Date("2026-03-17T00:05:00.000Z"),
        control: {
          id: crypto.randomUUID(),
          districtId,
          gangId,
          capturedAt: new Date("2026-03-17T00:10:00.000Z"),
          lastPayoutClaimedAt: null
        },
        activeWar: null
      })
      .mockResolvedValueOnce({
        id: districtId,
        name: "Downtown",
        payoutAmount: 1000,
        payoutCooldownMinutes: 60,
        createdAt: new Date("2026-03-17T00:05:00.000Z"),
        control: {
          id: crypto.randomUUID(),
          districtId,
          gangId,
          capturedAt: new Date("2026-03-17T00:10:00.000Z"),
          lastPayoutClaimedAt: new Date("2026-03-17T03:00:00.000Z")
        },
        activeWar: null
      });
    vi.mocked(repository.claimDistrictPayout).mockResolvedValue("claimed");
    vi.mocked(playerService.applyResourceDelta).mockResolvedValue({
      id: playerId,
      displayName: "Boss",
      cash: 4000,
      respect: 0,
      energy: 100,
      heat: 0,
      heatUpdatedAt: new Date("2026-03-17T00:00:00.000Z"),
      health: 100,
      jailedUntil: null,
      hospitalizedUntil: null,
      createdAt: new Date("2026-03-17T00:00:00.000Z"),
      updatedAt: new Date("2026-03-17T03:00:00.000Z")
    });

    const service = new TerritoryService(
      playerService,
      gangsService,
      domainEventsService,
      repository
    );
    const result = await service.claimDistrictPayout({
      districtId,
      gangId,
      playerId
    });

    expect(repository.claimDistrictPayout).toHaveBeenCalledWith({
      districtId,
      gangId,
      claimedAt: new Date("2026-03-17T03:00:00.000Z"),
      latestEligibleClaimedAt: new Date("2026-03-17T02:00:00.000Z")
    });
    expect(playerService.applyResourceDelta).toHaveBeenCalledWith(playerId, {
      cash: 1000
    });
    expect(domainEventsService.publish).toHaveBeenCalledWith({
      type: "territory.payout_claimed",
      occurredAt: new Date("2026-03-17T03:00:00.000Z"),
      playerId,
      gangId,
      districtId,
      districtName: "Downtown",
      payoutAmount: 1000
    });
    expect(result).toMatchObject({
      payoutAmount: 1000,
      paidToPlayerId: playerId,
      playerCashAfterClaim: 4000
    });

    vi.useRealTimers();
  });

  it("blocks a district payout when the district is uncontrolled", async () => {
    const playerService = createPlayerServiceMock();
    const gangsService = createGangsServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createTerritoryRepositoryMock();

    vi.mocked(gangsService.assertPlayerIsGangLeader).mockResolvedValue();
    vi.mocked(repository.findDistrictById).mockResolvedValue({
      id: crypto.randomUUID(),
      name: "Downtown",
      payoutAmount: 1000,
      payoutCooldownMinutes: 60,
      createdAt: new Date("2026-03-17T00:05:00.000Z"),
      control: null,
      activeWar: null
    });

    const service = new TerritoryService(
      playerService,
      gangsService,
      domainEventsService,
      repository
    );

    await expect(
      service.claimDistrictPayout({
        districtId: crypto.randomUUID(),
        gangId: crypto.randomUUID(),
        playerId: crypto.randomUUID()
      })
    ).rejects.toMatchObject({
      status: 409
    });
    expect(playerService.applyResourceDelta).not.toHaveBeenCalled();
  });

  it("blocks a district payout when the cooldown has not elapsed", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-17T03:00:00.000Z"));

    const playerService = createPlayerServiceMock();
    const gangsService = createGangsServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createTerritoryRepositoryMock();
    const districtId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerId = crypto.randomUUID();

    vi.mocked(gangsService.assertPlayerIsGangLeader).mockResolvedValue();
    vi.mocked(gangsService.getGangById).mockResolvedValue({
      id: gangId,
      name: "Night Owls",
      createdAt: new Date(),
      createdByPlayerId: playerId,
      memberCount: 2
    });
    vi.mocked(repository.findDistrictById).mockResolvedValue({
      id: districtId,
      name: "Downtown",
      payoutAmount: 1000,
      payoutCooldownMinutes: 60,
      createdAt: new Date("2026-03-17T00:05:00.000Z"),
      control: {
        id: crypto.randomUUID(),
        districtId,
        gangId,
        capturedAt: new Date("2026-03-17T00:10:00.000Z"),
        lastPayoutClaimedAt: new Date("2026-03-17T02:30:00.000Z")
      },
      activeWar: null
    });

    const service = new TerritoryService(
      playerService,
      gangsService,
      domainEventsService,
      repository
    );

    await expect(
      service.claimDistrictPayout({
        districtId,
        gangId,
        playerId
      })
    ).rejects.toMatchObject({
      status: 409
    });
    expect(repository.claimDistrictPayout).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("starts a war when another gang controls the district", async () => {
    const playerService = createPlayerServiceMock();
    const gangsService = createGangsServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createTerritoryRepositoryMock();
    const districtId = crypto.randomUUID();
    const attackerGangId = crypto.randomUUID();
    const defenderGangId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    const warId = crypto.randomUUID();

    vi.mocked(gangsService.assertPlayerIsGangLeader).mockResolvedValue();
    vi.mocked(gangsService.getGangById)
      .mockResolvedValueOnce({
        id: defenderGangId,
        name: "Defenders",
        createdAt: new Date(),
        createdByPlayerId: crypto.randomUUID(),
        memberCount: 2
      })
      .mockResolvedValueOnce({
        id: attackerGangId,
        name: "Attackers",
        createdAt: new Date(),
        createdByPlayerId: playerId,
        memberCount: 2
      })
      .mockResolvedValueOnce({
        id: defenderGangId,
        name: "Defenders",
        createdAt: new Date(),
        createdByPlayerId: crypto.randomUUID(),
        memberCount: 2
      });
    vi.mocked(repository.findDistrictById).mockResolvedValue({
      id: districtId,
      name: "Downtown",
      payoutAmount: 1000,
      payoutCooldownMinutes: 60,
      createdAt: new Date(),
      control: {
        id: crypto.randomUUID(),
        districtId,
        gangId: defenderGangId,
        capturedAt: new Date(),
        lastPayoutClaimedAt: null
      },
      activeWar: null
    });
    vi.mocked(repository.startWar).mockResolvedValue({
      id: warId,
      districtId,
      attackerGangId,
      defenderGangId,
      startedByPlayerId: playerId,
      status: "pending",
      createdAt: new Date("2026-03-17T00:45:00.000Z"),
      resolvedAt: null,
      winningGangId: null
    });

    const service = new TerritoryService(
      playerService,
      gangsService,
      domainEventsService,
      repository
    );
    const result = await service.startWar({
      districtId,
      playerId,
      attackerGangId
    });

    expect(result).toMatchObject({
      id: warId,
      attackerGangId,
      defenderGangId,
      status: "pending"
    });
  });

  it("resolves a war and updates district control through the winner", async () => {
    const playerService = createPlayerServiceMock();
    const gangsService = createGangsServiceMock();
    const domainEventsService = createDomainEventsServiceMock();
    const repository = createTerritoryRepositoryMock();
    const warId = crypto.randomUUID();
    const districtId = crypto.randomUUID();
    const attackerGangId = crypto.randomUUID();
    const defenderGangId = crypto.randomUUID();

    vi.mocked(repository.findWarById)
      .mockResolvedValueOnce({
        id: warId,
        districtId,
        attackerGangId,
        defenderGangId,
        startedByPlayerId: crypto.randomUUID(),
        status: "pending",
        createdAt: new Date("2026-03-17T00:45:00.000Z"),
        resolvedAt: null,
        winningGangId: null
      })
      .mockResolvedValueOnce({
        id: warId,
        districtId,
        attackerGangId,
        defenderGangId,
        startedByPlayerId: crypto.randomUUID(),
        status: "resolved",
        createdAt: new Date("2026-03-17T00:45:00.000Z"),
        resolvedAt: new Date("2026-03-17T01:00:00.000Z"),
        winningGangId: attackerGangId
      });
    vi.mocked(repository.resolveWar).mockResolvedValue({
      id: warId,
      districtId,
      attackerGangId,
      defenderGangId,
      startedByPlayerId: crypto.randomUUID(),
      status: "resolved",
      createdAt: new Date("2026-03-17T00:45:00.000Z"),
      resolvedAt: new Date("2026-03-17T01:00:00.000Z"),
      winningGangId: attackerGangId
    });
    vi.mocked(repository.findDistrictById).mockResolvedValue({
      id: districtId,
      name: "Downtown",
      payoutAmount: 1000,
      payoutCooldownMinutes: 60,
      createdAt: new Date(),
      control: {
        id: crypto.randomUUID(),
        districtId,
        gangId: attackerGangId,
        capturedAt: new Date("2026-03-17T01:00:00.000Z"),
        lastPayoutClaimedAt: null
      },
      activeWar: null
    });
    vi.mocked(gangsService.getGangById).mockImplementation(async (gangId: string) => ({
      id: gangId,
      name: gangId === attackerGangId ? "Attackers" : "Defenders",
      createdAt: new Date(),
      createdByPlayerId: crypto.randomUUID(),
      memberCount: 2
    }));

    const service = new TerritoryService(
      playerService,
      gangsService,
      domainEventsService,
      repository
    );
    const result = await service.resolveWar({
      warId,
      winningGangId: attackerGangId
    });

    expect(domainEventsService.publish).toHaveBeenCalledWith({
      type: "territory.war_won",
      occurredAt: new Date("2026-03-17T01:00:00.000Z"),
      warId,
      districtId,
      districtName: "Downtown",
      winningGangId: attackerGangId,
      winningGangName: "Attackers",
      attackerGangId,
      defenderGangId,
      resolvedAt: new Date("2026-03-17T01:00:00.000Z")
    });
    expect(result.war.status).toBe("resolved");
    expect(result.district.controller?.gangId).toBe(attackerGangId);
  });
});
