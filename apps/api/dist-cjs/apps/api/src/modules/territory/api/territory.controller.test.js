"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const territory_service_1 = require("../application/territory.service");
const territory_controller_1 = require("./territory.controller");
(0, vitest_1.describe)("TerritoryController", () => {
    let app;
    const territoryService = {
        claimDistrict: vitest_1.vi.fn(),
        claimDistrictPayout: vitest_1.vi.fn(),
        getDistrictById: vitest_1.vi.fn(),
        getDistrictWarById: vitest_1.vi.fn(),
        getDistrictWarForDistrict: vitest_1.vi.fn(),
        listDistricts: vitest_1.vi.fn(),
        resolveWar: vitest_1.vi.fn(),
        startWar: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [territory_controller_1.TerritoryController, territory_controller_1.DistrictWarsController],
            providers: [
                {
                    provide: territory_service_1.TerritoryService,
                    useValue: territoryService
                }
            ]
        }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    (0, vitest_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, vitest_1.it)("lists districts", async () => {
        vitest_1.vi.mocked(territoryService.listDistricts).mockResolvedValueOnce([
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
        const response = await (0, supertest_1.default)(app.getHttpServer()).get("/districts").expect(200);
        (0, vitest_1.expect)(response.body).toEqual([
            {
                id: vitest_1.expect.any(String),
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
    (0, vitest_1.it)("gets a district by id", async () => {
        const districtId = crypto.randomUUID();
        vitest_1.vi.mocked(territoryService.getDistrictById).mockResolvedValueOnce({
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/districts/${districtId}`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual({
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
    (0, vitest_1.it)("claims an unclaimed district for a gang", async () => {
        const districtId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(territoryService.claimDistrict).mockResolvedValueOnce({
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/districts/${districtId}/claim`)
            .send({
            playerId,
            gangId
        })
            .expect(201);
        (0, vitest_1.expect)(response.body.controller).toEqual({
            gangId,
            gangName: "Night Owls",
            capturedAt: "2026-03-17T00:10:00.000Z"
        });
        (0, vitest_1.expect)(response.body.payout).toEqual({
            amount: 1000,
            cooldownMinutes: 60,
            lastClaimedAt: null,
            nextClaimAvailableAt: null
        });
    });
    (0, vitest_1.it)("claims a district payout", async () => {
        const districtId = crypto.randomUUID();
        const gangId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(territoryService.claimDistrictPayout).mockResolvedValueOnce({
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/districts/${districtId}/payout/claim`)
            .send({
            playerId,
            gangId
        })
            .expect(201);
        (0, vitest_1.expect)(response.body).toEqual({
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
    (0, vitest_1.it)("starts a district war", async () => {
        const districtId = crypto.randomUUID();
        const attackerGangId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(territoryService.startWar).mockResolvedValueOnce({
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/districts/${districtId}/war/start`)
            .send({
            playerId,
            attackerGangId
        })
            .expect(201);
        (0, vitest_1.expect)(response.body.status).toBe("pending");
        (0, vitest_1.expect)(response.body.attackerGangId).toBe(attackerGangId);
    });
    (0, vitest_1.it)("gets the active district war", async () => {
        const districtId = crypto.randomUUID();
        vitest_1.vi.mocked(territoryService.getDistrictWarForDistrict).mockResolvedValueOnce({
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/districts/${districtId}/war`)
            .expect(200);
        (0, vitest_1.expect)(response.body.status).toBe("pending");
    });
    (0, vitest_1.it)("resolves a district war", async () => {
        const warId = crypto.randomUUID();
        const winningGangId = crypto.randomUUID();
        vitest_1.vi.mocked(territoryService.resolveWar).mockResolvedValueOnce({
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/district-wars/${warId}/resolve`)
            .send({ winningGangId })
            .expect(201);
        (0, vitest_1.expect)(response.body.war.status).toBe("resolved");
        (0, vitest_1.expect)(response.body.district.controller.gangId).toBe(winningGangId);
    });
});
