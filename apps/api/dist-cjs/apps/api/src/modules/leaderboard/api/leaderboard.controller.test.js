"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const leaderboard_repository_1 = require("../application/leaderboard.repository");
const leaderboard_module_1 = require("../leaderboard.module");
function createLeaderboardRepositoryMock() {
    return {
        listLeaderboardRecords: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("LeaderboardController", () => {
    let app;
    let repository;
    (0, vitest_1.beforeAll)(async () => {
        repository = createLeaderboardRepositoryMock();
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [leaderboard_module_1.LeaderboardModule]
        })
            .overrideProvider(leaderboard_repository_1.LEADERBOARD_REPOSITORY)
            .useValue(repository)
            .compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    (0, vitest_1.afterAll)(async () => {
        if (app) {
            await app.close();
        }
    });
    (0, vitest_1.it)("lists the available leaderboards", async () => {
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get("/leaderboards")
            .expect(200);
        (0, vitest_1.expect)(response.body.map((leaderboard) => leaderboard.id)).toEqual([
            "richest_players",
            "most_respected_players",
            "most_achievements_unlocked"
        ]);
    });
    (0, vitest_1.it)("returns a specific leaderboard", async () => {
        vitest_1.vi.mocked(repository.listLeaderboardRecords).mockResolvedValueOnce([
            {
                playerId: "player-1",
                displayName: "Boss",
                createdAt: new Date("2026-03-18T10:00:00.000Z"),
                metricValue: 9000
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get("/leaderboards/richest_players?limit=1")
            .expect(200);
        (0, vitest_1.expect)(response.body).toMatchObject({
            id: "richest_players",
            metricKey: "cash",
            limit: 1,
            entries: [
                {
                    rank: 1,
                    playerId: "player-1",
                    displayName: "Boss",
                    metricValue: 9000
                }
            ]
        });
    });
    (0, vitest_1.it)("rejects invalid leaderboard limits", async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .get("/leaderboards/richest_players?limit=abc")
            .expect(400);
    });
});
