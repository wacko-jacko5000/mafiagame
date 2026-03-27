"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const auth_guard_1 = require("../../auth/api/auth.guard");
const auth_service_1 = require("../../auth/application/auth.service");
const player_activity_service_1 = require("../application/player-activity.service");
const player_activity_controller_1 = require("./player-activity.controller");
(0, vitest_1.describe)("PlayerActivityController", () => {
    let app;
    const playerActivityService = {
        listPlayerActivity: vitest_1.vi.fn(),
        markActivityRead: vitest_1.vi.fn()
    };
    const authService = {
        authenticate: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [player_activity_controller_1.PlayerActivityController],
            providers: [
                {
                    provide: player_activity_service_1.PlayerActivityService,
                    useValue: playerActivityService
                },
                {
                    provide: auth_service_1.AuthService,
                    useValue: authService
                },
                auth_guard_1.AuthGuard
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
    (0, vitest_1.it)("lists player activity entries", async () => {
        const playerId = "11111111-1111-1111-1111-111111111111";
        vitest_1.vi.mocked(playerActivityService.listPlayerActivity).mockResolvedValueOnce([
            {
                id: "22222222-2222-2222-2222-222222222222",
                playerId,
                type: "market_item_sold",
                title: "Item sold",
                body: "Your Rusty Knife sold for $900.",
                createdAt: new Date("2026-03-18T10:00:00.000Z"),
                readAt: null
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}/activity?limit=10`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual([
            {
                id: "22222222-2222-2222-2222-222222222222",
                playerId,
                type: "market_item_sold",
                title: "Item sold",
                body: "Your Rusty Knife sold for $900.",
                createdAt: "2026-03-18T10:00:00.000Z",
                readAt: null
            }
        ]);
    });
    (0, vitest_1.it)("marks a player activity entry as read", async () => {
        const playerId = "11111111-1111-1111-1111-111111111111";
        const activityId = "22222222-2222-2222-2222-222222222222";
        vitest_1.vi.mocked(playerActivityService.markActivityRead).mockResolvedValueOnce({
            id: activityId,
            playerId,
            type: "achievement_unlocked",
            title: "Achievement unlocked",
            body: "First Crime: Complete your first crime attempt.",
            createdAt: new Date("2026-03-18T10:00:00.000Z"),
            readAt: new Date("2026-03-18T10:10:00.000Z")
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/players/${playerId}/activity/${activityId}/read`)
            .expect(201);
        (0, vitest_1.expect)(response.body.readAt).toBe("2026-03-18T10:10:00.000Z");
    });
    (0, vitest_1.it)("lists activity for the authenticated player", async () => {
        const playerId = "11111111-1111-1111-1111-111111111111";
        vitest_1.vi.mocked(authService.authenticate).mockResolvedValueOnce({
            accountId: crypto.randomUUID(),
            email: "test@example.com",
            playerId
        });
        vitest_1.vi.mocked(playerActivityService.listPlayerActivity).mockResolvedValueOnce([]);
        await (0, supertest_1.default)(app.getHttpServer())
            .get("/me/activity")
            .set("Authorization", "Bearer token-123")
            .expect(200);
    });
});
