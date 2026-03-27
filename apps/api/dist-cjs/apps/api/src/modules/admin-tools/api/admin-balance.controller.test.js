"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const auth_service_1 = require("../../auth/application/auth.service");
const auth_guard_1 = require("../../auth/api/auth.guard");
const admin_balance_service_1 = require("../application/admin-balance.service");
const admin_balance_controller_1 = require("./admin-balance.controller");
const admin_api_key_guard_1 = require("./admin-api-key.guard");
(0, vitest_1.describe)("AdminBalanceController", () => {
    let app;
    const adminBalanceService = {
        getAllSections: vitest_1.vi.fn(),
        getSection: vitest_1.vi.fn(),
        getAuditLog: vitest_1.vi.fn(),
        updateSection: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [admin_balance_controller_1.AdminBalanceController],
            providers: [
                admin_api_key_guard_1.AdminApiKeyGuard,
                auth_guard_1.OptionalAuthGuard,
                {
                    provide: admin_balance_service_1.AdminBalanceService,
                    useValue: adminBalanceService
                },
                {
                    provide: auth_service_1.AuthService,
                    useValue: {
                        authenticate: vitest_1.vi.fn((token) => {
                            if (token === "admin-token") {
                                return {
                                    accountId: crypto.randomUUID(),
                                    email: "boss@example.com",
                                    isAdmin: true,
                                    playerId: null
                                };
                            }
                            if (token === "user-token") {
                                return {
                                    accountId: crypto.randomUUID(),
                                    email: "user@example.com",
                                    isAdmin: false,
                                    playerId: null
                                };
                            }
                            return null;
                        })
                    }
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
    (0, vitest_1.it)("rejects requests without authentication", async () => {
        await (0, supertest_1.default)(app.getHttpServer()).get("/admin/balance").expect(401);
    });
    (0, vitest_1.it)("rejects authenticated non-admin accounts", async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .get("/admin/balance")
            .set("Authorization", "Bearer user-token")
            .expect(401);
    });
    (0, vitest_1.it)("lists all balance sections when authorized", async () => {
        vitest_1.vi.mocked(adminBalanceService.getAllSections).mockResolvedValueOnce([
            {
                section: "crimes",
                label: "Crime Catalog",
                editableFields: [
                    "energyCost",
                    "successRate",
                    "cashRewardMin",
                    "cashRewardMax",
                    "respectReward"
                ],
                entries: []
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get("/admin/balance")
            .set("Authorization", "Bearer admin-token")
            .expect(200);
        (0, vitest_1.expect)(response.body).toEqual({
            sections: [
                {
                    section: "crimes",
                    label: "Crime Catalog",
                    editableFields: [
                        "energyCost",
                        "successRate",
                        "cashRewardMin",
                        "cashRewardMax",
                        "respectReward"
                    ],
                    entries: []
                }
            ]
        });
    });
    (0, vitest_1.it)("lists audit entries when authorized", async () => {
        vitest_1.vi.mocked(adminBalanceService.getAuditLog).mockResolvedValueOnce([
            {
                id: crypto.randomUUID(),
                section: "shop-items",
                targetId: "rusty-knife",
                changedByAccountId: null,
                previousValue: {
                    id: "rusty-knife",
                    price: 400
                },
                newValue: {
                    id: "rusty-knife",
                    price: 450
                },
                changedAt: "2026-03-18T20:00:00.000Z"
            }
        ]);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get("/admin/balance/audit")
            .set("Authorization", "Bearer admin-token")
            .expect(200);
        (0, vitest_1.expect)(response.body.entries).toHaveLength(1);
        (0, vitest_1.expect)(adminBalanceService.getAuditLog).toHaveBeenCalledWith({
            section: undefined,
            targetId: undefined,
            limit: undefined
        });
    });
    (0, vitest_1.it)("updates a balance section when authorized", async () => {
        vitest_1.vi.mocked(adminBalanceService.updateSection).mockResolvedValueOnce({
            section: "shop-items",
            label: "Starter Shop Items",
            editableFields: ["price"],
            entries: [
                {
                    id: "rusty-knife",
                    name: "Glock 17",
                    type: "weapon",
                    price: 450,
                    equipSlot: "weapon"
                }
            ]
        });
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .patch("/admin/balance/shop-items")
            .set("Authorization", "Bearer admin-token")
            .send({
            items: [
                {
                    id: "rusty-knife",
                    price: 450
                }
            ]
        })
            .expect(200);
        (0, vitest_1.expect)(adminBalanceService.updateSection).toHaveBeenCalledWith("shop-items", {
            items: [
                {
                    id: "rusty-knife",
                    price: 450
                }
            ]
        }, vitest_1.expect.any(String));
        (0, vitest_1.expect)(response.body.entries[0]).toMatchObject({
            id: "rusty-knife",
            price: 450
        });
    });
});
