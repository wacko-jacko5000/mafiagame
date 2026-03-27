"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const hospital_controller_1 = require("./hospital.controller");
const hospital_service_1 = require("../application/hospital.service");
(0, vitest_1.describe)("HospitalController", () => {
    let app;
    const hospitalService = {
        getStatus: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [hospital_controller_1.HospitalController],
            providers: [
                {
                    provide: hospital_service_1.HospitalService,
                    useValue: hospitalService
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
    (0, vitest_1.it)("returns hospital status for a player", async () => {
        const playerId = crypto.randomUUID();
        vitest_1.vi.mocked(hospitalService.getStatus).mockResolvedValueOnce({
            playerId,
            active: true,
            until: new Date("2026-03-16T20:08:00.000Z"),
            remainingSeconds: 480
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/players/${playerId}/hospital/status`)
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual({
            playerId,
            active: true,
            until: "2026-03-16T20:08:00.000Z",
            remainingSeconds: 480
        });
    });
});
