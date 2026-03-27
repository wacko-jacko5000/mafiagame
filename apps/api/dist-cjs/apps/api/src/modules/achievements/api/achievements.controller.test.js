"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const achievements_service_1 = require("../application/achievements.service");
const achievements_controller_1 = require("./achievements.controller");
(0, vitest_1.describe)("AchievementsController", () => {
    let app;
    const achievementsService = {
        listAchievements: vitest_1.vi.fn(),
        listPlayerAchievements: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [achievements_controller_1.AchievementsController],
            providers: [
                {
                    provide: achievements_service_1.AchievementsService,
                    useValue: achievementsService
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
    (0, vitest_1.it)("lists achievement definitions", async () => {
        vitest_1.vi.mocked(achievementsService.listAchievements).mockReturnValueOnce([
            {
                id: "complete_first_crime",
                name: "First Crime",
                description: "Complete your first crime attempt.",
                triggerType: "crime_completed_count",
                targetCount: 1
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer()).get("/achievements").expect(200);
        (0, vitest_1.expect)(response.body).toEqual([
            {
                id: "complete_first_crime",
                name: "First Crime",
                description: "Complete your first crime attempt.",
                triggerType: "crime_completed_count",
                targetCount: 1
            }
        ]);
    });
    (0, vitest_1.it)("lists player achievement state", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(achievementsService.listPlayerAchievements).mockResolvedValueOnce([
            {
                playerId,
                achievementId: "sell_first_item",
                progress: 1,
                targetProgress: 1,
                unlockedAt: new Date("2026-03-18T10:00:00.000Z"),
                definition: {
                    id: "sell_first_item",
                    name: "First Sale",
                    description: "Sell your first item on the market.",
                    triggerType: "market_item_sold_count",
                    targetCount: 1
                }
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}/achievements`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual([
            {
                playerId,
                achievementId: "sell_first_item",
                progress: 1,
                targetProgress: 1,
                unlockedAt: "2026-03-18T10:00:00.000Z",
                definition: {
                    id: "sell_first_item",
                    name: "First Sale",
                    description: "Sell your first item on the market.",
                    triggerType: "market_item_sold_count",
                    targetCount: 1
                }
            }
        ]);
    });
});
