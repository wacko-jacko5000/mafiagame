"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const auth_guard_1 = require("./auth.guard");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("../application/auth.service");
(0, vitest_1.describe)("AuthController", () => {
    let app;
    const authService = {
        authenticate: vitest_1.vi.fn(),
        getAccountById: vitest_1.vi.fn(),
        login: vitest_1.vi.fn(),
        register: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                auth_guard_1.AuthGuard,
                {
                    provide: auth_service_1.AuthService,
                    useValue: authService
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
    (0, vitest_1.it)("registers an account and returns a bearer token", async () => {
        vitest_1.vi.mocked(authService.register).mockResolvedValueOnce({
            accessToken: "token-123",
            account: {
                id: crypto.randomUUID(),
                email: "test@example.com",
                passwordHash: "hidden",
                isAdmin: false,
                createdAt: new Date("2026-03-18T20:00:00.000Z"),
                updatedAt: new Date("2026-03-18T20:00:00.000Z"),
                player: null
            }
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post("/auth/register")
            .send({
            email: "test@example.com",
            password: "password123"
        })
            .expect(201);
        (0, vitest_1.expect)(response.body).toMatchObject({
            accessToken: "token-123",
            account: {
                email: "test@example.com",
                isAdmin: false,
                player: null
            }
        });
    });
    (0, vitest_1.it)("returns the authenticated account", async () => {
        const accountId = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(authService.authenticate).mockResolvedValueOnce({
            accountId,
            email: "test@example.com",
            isAdmin: true,
            playerId
        });
        vitest_1.vi.mocked(authService.getAccountById).mockResolvedValueOnce({
            id: accountId,
            email: "test@example.com",
            passwordHash: "hidden",
            isAdmin: true,
            createdAt: new Date("2026-03-18T20:00:00.000Z"),
            updatedAt: new Date("2026-03-18T20:00:00.000Z"),
            player: {
                id: playerId,
                displayName: "Don Luca"
            }
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get("/auth/me")
            .set("Authorization", "Bearer token-123")
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual({
            account: {
                id: accountId,
                email: "test@example.com",
                isAdmin: true,
                createdAt: "2026-03-18T20:00:00.000Z",
                updatedAt: "2026-03-18T20:00:00.000Z",
                player: {
                    id: playerId,
                    displayName: "Don Luca"
                }
            }
        });
    });
});
