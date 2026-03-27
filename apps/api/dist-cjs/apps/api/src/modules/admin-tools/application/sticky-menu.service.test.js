"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const sticky_menu_service_1 = require("./sticky-menu.service");
(0, vitest_1.describe)("StickyMenuService", () => {
    (0, vitest_1.it)("returns the default config when persistence has no row yet", async () => {
        const repository = {
            getConfig: vitest_1.vi.fn().mockResolvedValue(null),
            upsertConfig: vitest_1.vi.fn()
        };
        const service = new sticky_menu_service_1.StickyMenuService(repository);
        const config = await service.getConfig();
        (0, vitest_1.expect)(config.primaryItems).toEqual(["home", "crimes", "missions", "shop", "more"]);
        (0, vitest_1.expect)(config.moreItems).toContain("inventory");
        (0, vitest_1.expect)(config.header.resourceKeys).toEqual(["cash", "respect"]);
    });
    (0, vitest_1.it)("rejects duplicate or unsafe item placement", async () => {
        const repository = {
            getConfig: vitest_1.vi.fn(),
            upsertConfig: vitest_1.vi.fn()
        };
        const service = new sticky_menu_service_1.StickyMenuService(repository);
        await (0, vitest_1.expect)(service.updateConfig({
            header: {
                enabled: true,
                resourceKeys: ["cash", "respect"]
            },
            primaryItems: ["home", "crimes", "inventory", "shop", "more"],
            moreItems: ["inventory", "activity"]
        })).rejects.toMatchObject({
            status: 400
        });
    });
    (0, vitest_1.it)("persists a valid sticky menu layout", async () => {
        const repository = {
            getConfig: vitest_1.vi.fn(),
            upsertConfig: vitest_1.vi.fn().mockResolvedValue({
                id: "default",
                headerEnabled: true,
                headerResourceKeys: ["cash", "respect", "energy"],
                primaryItems: ["home", "inventory", "missions", "shop", "more"],
                moreItems: ["activity", "market", "leaderboard"],
                createdAt: new Date("2026-03-22T13:30:00.000Z"),
                updatedAt: new Date("2026-03-22T13:35:00.000Z")
            })
        };
        const service = new sticky_menu_service_1.StickyMenuService(repository);
        const config = await service.updateConfig({
            header: {
                enabled: true,
                resourceKeys: ["cash", "respect", "energy"]
            },
            primaryItems: ["home", "inventory", "missions", "shop", "more"],
            moreItems: ["activity", "market", "leaderboard"]
        });
        (0, vitest_1.expect)(repository.upsertConfig).toHaveBeenCalledWith({
            headerEnabled: true,
            headerResourceKeys: ["cash", "respect", "energy"],
            primaryItems: ["home", "inventory", "missions", "shop", "more"],
            moreItems: ["activity", "market", "leaderboard"]
        });
        (0, vitest_1.expect)(config.header.resourceKeys).toEqual(["cash", "respect", "energy"]);
        (0, vitest_1.expect)(config.moreItems).toEqual(["activity", "market", "leaderboard"]);
    });
});
