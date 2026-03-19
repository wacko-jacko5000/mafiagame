import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { TerritoryService } from "../application/territory.service";
import { DistrictWarsController, TerritoryController } from "./territory.controller";

describe("TerritoryController", () => {
  let app: INestApplication;
  const territoryService = {
    claimDistrict: vi.fn(),
    claimDistrictPayout: vi.fn(),
    getDistrictById: vi.fn(),
    getDistrictWarById: vi.fn(),
    getDistrictWarForDistrict: vi.fn(),
    listDistricts: vi.fn(),
    resolveWar: vi.fn(),
    startWar: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TerritoryController, DistrictWarsController],
      providers: [
        {
          provide: TerritoryService,
          useValue: territoryService
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("lists districts", async () => {
    vi.mocked(territoryService.listDistricts).mockResolvedValueOnce([
      {
        id: crypto.randomUUID(),
        name: "Downtown",
        payout: {
          amount: 1000,
          cooldownMinutes: 60,
          lastClaimedAt: null,
          nextClaimAvailableAt: null
        },
        createdAt: new Date("2026-03-17T00:05:00.000Z"),
        controller: null,
        activeWar: null
      }
    ]);

    const response = await request(app.getHttpServer()).get("/districts").expect(200);

    expect(response.body).toEqual([
      {
        id: expect.any(String),
        name: "Downtown",
        payout: {
          amount: 1000,
          cooldownMinutes: 60,
          lastClaimedAt: null,
          nextClaimAvailableAt: null
        },
        createdAt: "2026-03-17T00:05:00.000Z",
        controller: null,
        activeWar: null
      }
    ]);
  });

  it("gets a district by id", async () => {
    const districtId = crypto.randomUUID();
    vi.mocked(territoryService.getDistrictById).mockResolvedValueOnce({
      id: districtId,
      name: "Little Italy",
      payout: {
        amount: 1000,
        cooldownMinutes: 60,
        lastClaimedAt: null,
        nextClaimAvailableAt: null
      },
      createdAt: new Date("2026-03-17T00:05:00.000Z"),
      controller: null,
      activeWar: null
    });

    const response = await request(app.getHttpServer())
      .get(`/districts/${districtId}`)
      .expect(200);

    expect(response.body).toEqual({
      id: districtId,
      name: "Little Italy",
      payout: {
        amount: 1000,
        cooldownMinutes: 60,
        lastClaimedAt: null,
        nextClaimAvailableAt: null
      },
      createdAt: "2026-03-17T00:05:00.000Z",
      controller: null,
      activeWar: null
    });
  });

  it("claims an unclaimed district for a gang", async () => {
    const districtId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerId = crypto.randomUUID();

    vi.mocked(territoryService.claimDistrict).mockResolvedValueOnce({
      id: districtId,
      name: "Downtown",
      payout: {
        amount: 1000,
        cooldownMinutes: 60,
        lastClaimedAt: null,
        nextClaimAvailableAt: null
      },
      createdAt: new Date("2026-03-17T00:05:00.000Z"),
      controller: {
        gangId,
        gangName: "Night Owls",
        capturedAt: new Date("2026-03-17T00:10:00.000Z")
      },
      activeWar: null
    });

    const response = await request(app.getHttpServer())
      .post(`/districts/${districtId}/claim`)
      .send({
        playerId,
        gangId
      })
      .expect(201);

    expect(response.body.controller).toEqual({
      gangId,
      gangName: "Night Owls",
      capturedAt: "2026-03-17T00:10:00.000Z"
    });
    expect(response.body.payout).toEqual({
      amount: 1000,
      cooldownMinutes: 60,
      lastClaimedAt: null,
      nextClaimAvailableAt: null
    });
  });

  it("claims a district payout", async () => {
    const districtId = crypto.randomUUID();
    const gangId = crypto.randomUUID();
    const playerId = crypto.randomUUID();

    vi.mocked(territoryService.claimDistrictPayout).mockResolvedValueOnce({
      district: {
        id: districtId,
        name: "Downtown",
        payout: {
          amount: 1000,
          cooldownMinutes: 60,
          lastClaimedAt: new Date("2026-03-17T03:00:00.000Z"),
          nextClaimAvailableAt: new Date("2026-03-17T04:00:00.000Z")
        },
        createdAt: new Date("2026-03-17T00:05:00.000Z"),
        controller: {
          gangId,
          gangName: "Night Owls",
          capturedAt: new Date("2026-03-17T00:10:00.000Z")
        },
        activeWar: null
      },
      payoutAmount: 1000,
      claimedAt: new Date("2026-03-17T03:00:00.000Z"),
      paidToPlayerId: playerId,
      playerCashAfterClaim: 4000
    });

    const response = await request(app.getHttpServer())
      .post(`/districts/${districtId}/payout/claim`)
      .send({
        playerId,
        gangId
      })
      .expect(201);

    expect(response.body).toEqual({
      district: {
        id: districtId,
        name: "Downtown",
        payout: {
          amount: 1000,
          cooldownMinutes: 60,
          lastClaimedAt: "2026-03-17T03:00:00.000Z",
          nextClaimAvailableAt: "2026-03-17T04:00:00.000Z"
        },
        createdAt: "2026-03-17T00:05:00.000Z",
        controller: {
          gangId,
          gangName: "Night Owls",
          capturedAt: "2026-03-17T00:10:00.000Z"
        },
        activeWar: null
      },
      payoutAmount: 1000,
      claimedAt: "2026-03-17T03:00:00.000Z",
      paidToPlayerId: playerId,
      playerCashAfterClaim: 4000
    });
  });

  it("starts a district war", async () => {
    const districtId = crypto.randomUUID();
    const attackerGangId = crypto.randomUUID();
    const playerId = crypto.randomUUID();

    vi.mocked(territoryService.startWar).mockResolvedValueOnce({
      id: crypto.randomUUID(),
      districtId,
      attackerGangId,
      attackerGangName: "Attackers",
      defenderGangId: crypto.randomUUID(),
      defenderGangName: "Defenders",
      startedByPlayerId: playerId,
      status: "pending",
      createdAt: new Date("2026-03-17T00:45:00.000Z"),
      resolvedAt: null,
      winningGangId: null,
      winningGangName: null
    });

    const response = await request(app.getHttpServer())
      .post(`/districts/${districtId}/war/start`)
      .send({
        playerId,
        attackerGangId
      })
      .expect(201);

    expect(response.body.status).toBe("pending");
    expect(response.body.attackerGangId).toBe(attackerGangId);
  });

  it("gets the active district war", async () => {
    const districtId = crypto.randomUUID();
    vi.mocked(territoryService.getDistrictWarForDistrict).mockResolvedValueOnce({
      id: crypto.randomUUID(),
      districtId,
      attackerGangId: crypto.randomUUID(),
      attackerGangName: "Attackers",
      defenderGangId: crypto.randomUUID(),
      defenderGangName: "Defenders",
      startedByPlayerId: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date("2026-03-17T00:45:00.000Z"),
      resolvedAt: null,
      winningGangId: null,
      winningGangName: null
    });

    const response = await request(app.getHttpServer())
      .get(`/districts/${districtId}/war`)
      .expect(200);

    expect(response.body.status).toBe("pending");
  });

  it("resolves a district war", async () => {
    const warId = crypto.randomUUID();
    const winningGangId = crypto.randomUUID();

    vi.mocked(territoryService.resolveWar).mockResolvedValueOnce({
      war: {
        id: warId,
        districtId: crypto.randomUUID(),
        attackerGangId: winningGangId,
        attackerGangName: "Attackers",
        defenderGangId: crypto.randomUUID(),
        defenderGangName: "Defenders",
        startedByPlayerId: crypto.randomUUID(),
        status: "resolved",
        createdAt: new Date("2026-03-17T00:45:00.000Z"),
        resolvedAt: new Date("2026-03-17T01:00:00.000Z"),
        winningGangId,
        winningGangName: "Attackers"
      },
      district: {
        id: crypto.randomUUID(),
        name: "Downtown",
        payout: {
          amount: 1000,
          cooldownMinutes: 60,
          lastClaimedAt: null,
          nextClaimAvailableAt: null
        },
        createdAt: new Date("2026-03-17T00:05:00.000Z"),
        controller: {
          gangId: winningGangId,
          gangName: "Attackers",
          capturedAt: new Date("2026-03-17T01:00:00.000Z")
        },
        activeWar: null
      }
    });

    const response = await request(app.getHttpServer())
      .post(`/district-wars/${warId}/resolve`)
      .send({ winningGangId })
      .expect(201);

    expect(response.body.war.status).toBe("resolved");
    expect(response.body.district.controller.gangId).toBe(winningGangId);
  });
});
