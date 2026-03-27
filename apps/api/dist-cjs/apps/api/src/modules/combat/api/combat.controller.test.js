"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const combat_service_1 = require("../application/combat.service");
const combat_controller_1 = require("./combat.controller");
(0, vitest_1.describe)("CombatController", () => {
    let app;
    const combatService = {
        attack: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [combat_controller_1.CombatController],
            providers: [
                {
                    provide: combat_service_1.CombatService,
                    useValue: combatService
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
    (0, vitest_1.it)("attacks a target player", async () => {
        const attackerId = crypto.randomUUID();
        const targetId = crypto.randomUUID();
        vitest_1.vi.mocked(combatService.attack).mockResolvedValueOnce({
            attackerId,
            targetId,
            attackerWeaponItemId: "cheap-pistol",
            targetArmorItemId: "leather-jacket",
            baseAttack: 12,
            weaponBonus: 8,
            armorReduction: 3,
            damageDealt: 17,
            targetHealthBefore: 100,
            targetHealthAfter: 83,
            targetHospitalized: false,
            hospitalizedUntil: null
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/combat/players/${attackerId}/attack/${targetId}`)
            .expect(201);
        (0, vitest_1.expect)(response.body).toMatchObject({
            attackerId,
            targetId,
            damageDealt: 17,
            targetHealthAfter: 83
        });
    });
});
