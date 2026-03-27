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
const missions_service_1 = require("../application/missions.service");
const missions_controller_1 = require("./missions.controller");
(0, vitest_1.describe)("MissionsController", () => {
    let app;
    const missionsService = {
        acceptMission: vitest_1.vi.fn(),
        completeMission: vitest_1.vi.fn(),
        listMissions: vitest_1.vi.fn(),
        listPlayerMissions: vitest_1.vi.fn()
    };
    const authService = {
        authenticate: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [missions_controller_1.MissionsController],
            providers: [
                {
                    provide: missions_service_1.MissionsService,
                    useValue: missionsService
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
    (0, vitest_1.it)("lists mission definitions", async () => {
        vitest_1.vi.mocked(missionsService.listMissions).mockReturnValueOnce([
            {
                id: "level-1-complete-5-crimes",
                name: "Complete 5 crimes",
                description: "Complete 5 crimes",
                unlockLevel: 1,
                objectiveType: "crime_count",
                target: 5,
                rewardCash: 500,
                rewardRespect: 10,
                isRepeatable: false
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer()).get("/missions").expect(200);
        (0, vitest_1.expect)(response.body).toEqual([
            {
                id: "level-1-complete-5-crimes",
                name: "Complete 5 crimes",
                description: "Complete 5 crimes",
                unlockLevel: 1,
                requiredLevel: 1,
                objectiveType: "crime_count",
                target: 5,
                objectiveTarget: 5,
                rewardCash: 500,
                rewardRespect: 10,
                isRepeatable: false
            }
        ]);
    });
    (0, vitest_1.it)("lists player missions", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(missionsService.listPlayerMissions).mockResolvedValueOnce([
            {
                id: crypto.randomUUID(),
                playerId,
                missionId: "level-1-complete-5-crimes",
                status: "active",
                progress: 1,
                targetProgress: 5,
                acceptedAt: new Date("2026-03-18T10:00:00.000Z"),
                completedAt: null,
                definition: {
                    id: "level-1-complete-5-crimes",
                    name: "Complete 5 crimes",
                    description: "Complete 5 crimes",
                    unlockLevel: 1,
                    objectiveType: "crime_count",
                    target: 5,
                    rewardCash: 500,
                    rewardRespect: 10,
                    isRepeatable: false
                }
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}/missions`)
            .expect(200);
        (0, vitest_1.expect)(response.body[0]).toMatchObject({
            playerId,
            missionId: "level-1-complete-5-crimes",
            status: "active",
            progress: 1
        });
    });
});
