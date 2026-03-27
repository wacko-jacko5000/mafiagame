"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const auth_service_1 = require("../../auth/application/auth.service");
const sticky_menu_service_1 = require("../application/sticky-menu.service");
const sticky_menu_controller_1 = require("./sticky-menu.controller");
const admin_api_key_guard_1 = require("./admin-api-key.guard");
(0, vitest_1.describe)("StickyMenuController", () => {
    let app;
    const stickyMenuService = {
        getConfig: vitest_1.vi.fn(),
        updateConfig: vitest_1.vi.fn()
    };
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [sticky_menu_controller_1.StickyMenuController, sticky_menu_controller_1.AdminStickyMenuController],
            providers: [
                admin_api_key_guard_1.AdminApiKeyGuard,
                {
                    provide: sticky_menu_service_1.StickyMenuService,
                    useValue: stickyMenuService
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
    (0, vitest_1.it)("returns sticky menu config from the public route", async () => {
        vitest_1.vi.mocked(stickyMenuService.getConfig).mockResolvedValueOnce({
            header: {
                enabled: true,
                resourceKeys: ["cash", "respect"]
            },
            primaryItems: ["home", "crimes", "missions", "shop", "more"],
            moreItems: ["inventory", "activity"],
            availableDestinationKeys: [
                "home",
                "crimes",
                "missions",
                "shop",
                "business",
                "inventory",
                "activity",
                "achievements",
                "gangs",
                "territory",
                "market",
                "leaderboard",
                "more"
            ],
            availableHeaderResourceKeys: ["cash", "respect", "energy", "health", "rank"],
            maxPrimaryItems: 5
        });
        const response = await (0, supertest_1.default)(app.getHttpServer()).get("/sticky-menu").expect(200);
        (0, vitest_1.expect)(response.body.primaryItems).toEqual(["home", "crimes", "missions", "shop", "more"]);
    });
    (0, vitest_1.it)("updates sticky menu config through the admin route", async () => {
        vitest_1.vi.mocked(stickyMenuService.updateConfig).mockResolvedValueOnce({
            header: {
                enabled: true,
                resourceKeys: ["cash", "respect", "energy"]
            },
            primaryItems: ["home", "inventory", "missions", "shop", "more"],
            moreItems: ["activity", "market"],
            availableDestinationKeys: [
                "home",
                "crimes",
                "missions",
                "shop",
                "business",
                "inventory",
                "activity",
                "achievements",
                "gangs",
                "territory",
                "market",
                "leaderboard",
                "more"
            ],
            availableHeaderResourceKeys: ["cash", "respect", "energy", "health", "rank"],
            maxPrimaryItems: 5
        });
        const payload = {
            header: {
                enabled: true,
                resourceKeys: ["cash", "respect", "energy"]
            },
            primaryItems: ["home", "inventory", "missions", "shop", "more"],
            moreItems: ["activity", "market"]
        };
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .patch("/admin/sticky-menu")
            .set("Authorization", "Bearer admin-token")
            .send(payload)
            .expect(200);
        (0, vitest_1.expect)(stickyMenuService.updateConfig).toHaveBeenCalledWith(payload);
        (0, vitest_1.expect)(response.body.moreItems).toEqual(["activity", "market"]);
    });
});
