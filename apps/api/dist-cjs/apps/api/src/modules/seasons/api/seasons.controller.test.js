"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const admin_api_key_guard_1 = require("../../admin-tools/api/admin-api-key.guard");
const auth_service_1 = require("../../auth/application/auth.service");
const seasons_service_1 = require("../application/seasons.service");
const seasons_controller_1 = require("./seasons.controller");
(0, vitest_1.describe)("SeasonsController", () => {
    let app;
    const seasonsService = {
        listSeasons: vitest_1.vi.fn(),
        getCurrentSeason: vitest_1.vi.fn(),
        getSeasonById: vitest_1.vi.fn(),
        createSeason: vitest_1.vi.fn(),
        activateSeason: vitest_1.vi.fn(),
        deactivateSeason: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [seasons_controller_1.SeasonsController, seasons_controller_1.AdminSeasonsController],
            providers: [
                admin_api_key_guard_1.AdminApiKeyGuard,
                {
                    provide: seasons_service_1.SeasonsService,
                    useValue: seasonsService
                },
                {
                    provide: auth_service_1.AuthService,
                    useValue: {
                        authenticate: vitest_1.vi.fn((token) => {
                            if (token === "admin-token") {
                                return {
                                    accountId: crypto.randomUUID(),
                                    email: "boss@example.com",
                                    isAdmin: true,
                                    playerId: null
                                };
                            }
                            if (token === "user-token") {
                                return {
                                    accountId: crypto.randomUUID(),
                                    email: "user@example.com",
                                    isAdmin: false,
                                    playerId: null
                                };
                            }
                            return null;
                        })
                    }
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
    (0, vitest_1.it)("lists season history", async () => {
        vitest_1.vi.mocked(seasonsService.listSeasons).mockResolvedValueOnce([
            {
                id: crypto.randomUUID(),
                name: "Season One",
                status: "inactive",
                startsAt: null,
                endsAt: null,
                activatedAt: new Date("2026-03-01T00:00:00.000Z"),
                deactivatedAt: new Date("2026-03-10T00:00:00.000Z"),
                createdAt: new Date("2026-02-20T00:00:00.000Z")
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer()).get("/seasons").expect(200);
        (0, vitest_1.expect)(response.body).toEqual([
            {
                id: vitest_1.expect.any(String),
                name: "Season One",
                status: "inactive",
                startsAt: null,
                endsAt: null,
                activatedAt: "2026-03-01T00:00:00.000Z",
                deactivatedAt: "2026-03-10T00:00:00.000Z",
                createdAt: "2026-02-20T00:00:00.000Z"
            }
        ]);
    });
    (0, vitest_1.it)("returns the current season when one is active", async () => {
        const seasonId = crypto.randomUUID();
        vitest_1.vi.mocked(seasonsService.getCurrentSeason).mockResolvedValueOnce({
            id: seasonId,
            name: "Season Two",
            status: "active",
            startsAt: null,
            endsAt: null,
            activatedAt: new Date("2026-03-18T20:00:00.000Z"),
            deactivatedAt: null,
            createdAt: new Date("2026-03-15T00:00:00.000Z")
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get("/seasons/current")
            .expect(200);
        (0, vitest_1.expect)(response.body).toMatchObject({
            season: {
                id: seasonId,
                name: "Season Two",
                status: "active"
            }
        });
    });
    (0, vitest_1.it)("returns null when no season is active", async () => {
        vitest_1.vi.mocked(seasonsService.getCurrentSeason).mockResolvedValueOnce(null);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get("/seasons/current")
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual({
            season: null
        });
    });
    (0, vitest_1.it)("returns a single season by id", async () => {
        const seasonId = crypto.randomUUID();
        vitest_1.vi.mocked(seasonsService.getSeasonById).mockResolvedValueOnce({
            id: seasonId,
            name: "Season Three",
            status: "draft",
            startsAt: new Date("2026-04-01T00:00:00.000Z"),
            endsAt: new Date("2026-04-30T00:00:00.000Z"),
            activatedAt: null,
            deactivatedAt: null,
            createdAt: new Date("2026-03-18T00:00:00.000Z")
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/seasons/${seasonId}`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toMatchObject({
            id: seasonId,
            name: "Season Three",
            status: "draft",
            startsAt: "2026-04-01T00:00:00.000Z",
            endsAt: "2026-04-30T00:00:00.000Z"
        });
    });
    (0, vitest_1.it)("rejects admin season creation without authentication", async () => {
        await (0, supertest_1.default)(app.getHttpServer()).post("/admin/seasons").send({}).expect(401);
    });
    (0, vitest_1.it)("rejects admin season creation for non-admin accounts", async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .post("/admin/seasons")
            .set("Authorization", "Bearer user-token")
            .send({})
            .expect(401);
    });
    (0, vitest_1.it)("creates a season through the admin route", async () => {
        const seasonId = crypto.randomUUID();
        vitest_1.vi.mocked(seasonsService.createSeason).mockResolvedValueOnce({
            id: seasonId,
            name: "Spring Season",
            status: "draft",
            startsAt: new Date("2026-04-01T00:00:00.000Z"),
            endsAt: new Date("2026-04-30T00:00:00.000Z"),
            activatedAt: null,
            deactivatedAt: null,
            createdAt: new Date("2026-03-18T21:00:00.000Z")
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post("/admin/seasons")
            .set("Authorization", "Bearer admin-token")
            .send({
            name: "Spring Season",
            startsAt: "2026-04-01T00:00:00.000Z",
            endsAt: "2026-04-30T00:00:00.000Z"
        })
            .expect(201);
        (0, vitest_1.expect)(seasonsService.createSeason).toHaveBeenCalledWith({
            name: "Spring Season",
            startsAt: new Date("2026-04-01T00:00:00.000Z"),
            endsAt: new Date("2026-04-30T00:00:00.000Z")
        });
        (0, vitest_1.expect)(response.body).toMatchObject({
            id: seasonId,
            name: "Spring Season",
            status: "draft"
        });
    });
    (0, vitest_1.it)("activates a season through the admin route", async () => {
        const seasonId = crypto.randomUUID();
        vitest_1.vi.mocked(seasonsService.activateSeason).mockResolvedValueOnce({
            id: seasonId,
            name: "Season Four",
            status: "active",
            startsAt: null,
            endsAt: null,
            activatedAt: new Date("2026-03-18T21:15:00.000Z"),
            deactivatedAt: null,
            createdAt: new Date("2026-03-18T21:00:00.000Z")
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/admin/seasons/${seasonId}/activate`)
            .set("Authorization", "Bearer admin-token")
            .expect(201);
        (0, vitest_1.expect)(seasonsService.activateSeason).toHaveBeenCalledWith(seasonId);
        (0, vitest_1.expect)(response.body.status).toBe("active");
    });
    (0, vitest_1.it)("deactivates a season through the admin route", async () => {
        const seasonId = crypto.randomUUID();
        vitest_1.vi.mocked(seasonsService.deactivateSeason).mockResolvedValueOnce({
            id: seasonId,
            name: "Season Five",
            status: "inactive",
            startsAt: null,
            endsAt: null,
            activatedAt: new Date("2026-03-17T00:00:00.000Z"),
            deactivatedAt: new Date("2026-03-18T21:20:00.000Z"),
            createdAt: new Date("2026-03-16T00:00:00.000Z")
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/admin/seasons/${seasonId}/deactivate`)
            .set("Authorization", "Bearer admin-token")
            .expect(201);
        (0, vitest_1.expect)(seasonsService.deactivateSeason).toHaveBeenCalledWith(seasonId);
        (0, vitest_1.expect)(response.body.status).toBe("inactive");
    });
});
