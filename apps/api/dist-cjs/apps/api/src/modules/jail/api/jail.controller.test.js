"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const jail_controller_1 = require("./jail.controller");
const jail_service_1 = require("../application/jail.service");
(0, vitest_1.describe)("JailController", () => {
    let app;
    const jailService = {
        getStatus: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [jail_controller_1.JailController],
            providers: [
                {
                    provide: jail_service_1.JailService,
                    useValue: jailService
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
    (0, vitest_1.it)("returns jail status for a player", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(jailService.getStatus).mockResolvedValueOnce({
            playerId,
            active: true,
            until: new Date("2026-03-16T20:05:00.000Z"),
            remainingSeconds: 300
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}/jail/status`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual({
            playerId,
            active: true,
            until: "2026-03-16T20:05:00.000Z",
            remainingSeconds: 300
        });
    });
});
