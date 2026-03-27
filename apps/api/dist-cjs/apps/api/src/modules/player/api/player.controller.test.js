"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const auth_service_1 = require("../../auth/application/auth.service");
const player_module_1 = require("../player.module");
const player_repository_1 = require("../application/player.repository");
function createRepositoryMock() {
    return {
        create: vitest_1.vi.fn(),
        applyResourceDelta: vitest_1.vi.fn(),
        updateCustodyStatus: vitest_1.vi.fn(),
        applyCustodyEntry: vitest_1.vi.fn(),
        buyOutCustodyStatus: vitest_1.vi.fn(),
        findByAccountId: vitest_1.vi.fn(),
        findByDisplayName: vitest_1.vi.fn(),
        findById: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("PlayerController", () => {
    let app;
    let repository;
    const authService = {
        authenticate: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        repository = createRepositoryMock();
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [player_module_1.PlayerModule]
        })
            .overrideProvider(auth_service_1.AuthService)
            .useValue(authService)
            .overrideProvider(player_repository_1.PLAYER_REPOSITORY)
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
    (0, vitest_1.it)("creates a player", async () => {
        const now = new Date("2026-03-16T20:00:00.000Z");
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findByDisplayName).mockResolvedValueOnce(null);
        vitest_1.vi.mocked(repository.create).mockResolvedValueOnce({
            id: playerId,
            accountId: null,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: now,
            updatedAt: now
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post("/players")
            .send({ displayName: "Don Luca" })
            .expect(201);
        (0, vitest_1.expect)(response.body).toMatchObject({
            id: playerId,
            displayName: "Don Luca",
            cash: 2500,
            level: 1,
            rank: "Scum",
            currentRespect: 0,
            currentLevelMinRespect: 0,
            nextLevel: 2,
            nextRank: "Empty Suit",
            nextLevelRespectRequired: 100,
            respectToNextLevel: 100,
            progressPercent: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null
        });
    });
    (0, vitest_1.it)("fetches a player by id", async () => {
        const now = new Date("2026-03-16T20:00:00.000Z");
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findById).mockResolvedValueOnce({
            id: playerId,
            accountId: null,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: now,
            updatedAt: now
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}`)
            .expect(200);
        (0, vitest_1.expect)(response.body.id).toBe(playerId);
        (0, vitest_1.expect)(response.body.displayName).toBe("Don Luca");
        (0, vitest_1.expect)(response.body.level).toBe(1);
        (0, vitest_1.expect)(response.body.rank).toBe("Scum");
        (0, vitest_1.expect)(response.body.currentRespect).toBe(0);
    });
    (0, vitest_1.it)("fetches player resources", async () => {
        const now = new Date("2026-03-16T20:00:00.000Z");
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findById).mockResolvedValueOnce({
            id: playerId,
            accountId: null,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: now,
            updatedAt: now
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}/resources`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual({
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100
        });
    });
    (0, vitest_1.it)("rejects invalid player names", async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .post("/players")
            .send({ displayName: "x" })
            .expect(400);
    });
    (0, vitest_1.it)("rejects invalid player ids", async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .get("/players/not-a-uuid")
            .expect(400);
    });
    (0, vitest_1.it)("binds a created player to the authenticated account when a bearer token is present", async () => {
        const accountId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(authService.authenticate).mockResolvedValueOnce({
            accountId,
            email: "test@example.com",
            playerId: null
        });
        vitest_1.vi.mocked(repository.findByDisplayName).mockResolvedValueOnce(null);
        vitest_1.vi.mocked(repository.findByAccountId).mockResolvedValueOnce(null);
        vitest_1.vi.mocked(repository.create).mockResolvedValueOnce({
            id: playerId,
            accountId,
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100,
            jailedUntil: null,
            hospitalizedUntil: null,
            createdAt: new Date("2026-03-16T20:00:00.000Z"),
            updatedAt: new Date("2026-03-16T20:00:00.000Z")
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post("/players")
            .set("Authorization", "Bearer token-123")
            .send({ displayName: "Don Luca" })
            .expect(201);
        (0, vitest_1.expect)(response.body.id).toBe(playerId);
        (0, vitest_1.expect)(repository.findByAccountId).toHaveBeenCalledWith(accountId);
    });
});
