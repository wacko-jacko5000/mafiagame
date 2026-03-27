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
const hospital_service_1 = require("../../hospital/application/hospital.service");
const jail_service_1 = require("../../jail/application/jail.service");
const player_service_1 = require("../../player/application/player.service");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const crime_constants_1 = require("../application/crime.constants");
const crime_service_1 = require("../application/crime.service");
const crime_controller_1 = require("./crime.controller");
(0, vitest_1.describe)("CrimeController", () => {
    let app;
    const playerService = {
        getPlayerById: vitest_1.vi.fn(),
        getPlayerByIdAt: vitest_1.vi.fn(),
        applyResourceDelta: vitest_1.vi.fn()
    };
    const jailService = {
        getStatus: vitest_1.vi.fn(),
        jailPlayer: vitest_1.vi.fn()
    };
    const hospitalService = {
        getStatus: vitest_1.vi.fn(),
        hospitalizePlayer: vitest_1.vi.fn()
    };
    const domainEventsService = {
        publish: vitest_1.vi.fn()
    };
    const authService = {
        authenticate: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [crime_controller_1.CrimeController],
            providers: [
                crime_service_1.CrimeService,
                {
                    provide: player_service_1.PlayerService,
                    useValue: playerService
                },
                {
                    provide: jail_service_1.JailService,
                    useValue: jailService
                },
                {
                    provide: hospital_service_1.HospitalService,
                    useValue: hospitalService
                },
                {
                    provide: domain_events_service_1.DomainEventsService,
                    useValue: domainEventsService
                },
                {
                    provide: auth_service_1.AuthService,
                    useValue: authService
                },
                auth_guard_1.AuthGuard,
                {
                    provide: crime_constants_1.CRIME_RANDOM_PROVIDER,
                    useValue: () => 0.3
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
    (0, vitest_1.it)("lists available crimes", async () => {
        const response = await (0, supertest_1.default)(app.getHttpServer()).get("/crimes").expect(200);
        (0, vitest_1.expect)(response.body).toHaveLength(84);
        (0, vitest_1.expect)(response.body[0]).toMatchObject({
            id: "pickpocket",
            unlockLevel: 1,
            requiredLevel: 1,
            minReward: 50,
            maxReward: 120
        });
    });
    (0, vitest_1.it)("executes a crime for a player", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(jailService.getStatus).mockResolvedValueOnce({
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(hospitalService.getStatus).mockResolvedValueOnce({
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(playerService.getPlayerByIdAt).mockResolvedValueOnce({
            id: playerId,
            accountId: null,
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
        vitest_1.vi.mocked(playerService.applyResourceDelta).mockResolvedValueOnce({
            id: playerId,
            accountId: null,
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/players/${playerId}/crimes/pickpocket/execute`)
            .expect(201);
        (0, vitest_1.expect)(response.body).toMatchObject({
            crimeId: "pickpocket",
            success: true,
            energySpent: 10,
            consequence: {
                type: "none",
                activeUntil: null
            }
        });
    });
    (0, vitest_1.it)("executes a crime for the authenticated player", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(authService.authenticate).mockResolvedValueOnce({
            accountId: crypto.randomUUID(),
            email: "test@example.com",
            playerId
        });
        vitest_1.vi.mocked(jailService.getStatus).mockResolvedValueOnce({
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(hospitalService.getStatus).mockResolvedValueOnce({
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0
        });
        vitest_1.vi.mocked(playerService.getPlayerByIdAt).mockResolvedValueOnce({
            id: playerId,
            accountId: null,
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
        vitest_1.vi.mocked(playerService.applyResourceDelta).mockResolvedValueOnce({
            id: playerId,
            accountId: null,
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
        await (0, supertest_1.default)(app.getHttpServer())
            .post("/me/crimes/pickpocket/execute")
            .set("Authorization", "Bearer token-123")
            .expect(201);
    });
});
