"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const inventory_catalog_1 = require("../domain/inventory.catalog");
const inventory_balance_service_1 = require("./inventory-balance.service");
(0, vitest_1.describe)("InventoryBalanceService", () => {
    (0, vitest_1.afterEach)(() => {
        (0, inventory_catalog_1.resetStarterItemCatalog)();
    });
    (0, vitest_1.it)("hydrates persisted shop item prices on module init", async () => {
        const repository = {
            listShopItemBalances: vitest_1.vi.fn().mockResolvedValue([
                {
                    itemId: "rusty-knife",
                    price: 450
                }
            ]),
            upsertShopItemBalance: vitest_1.vi.fn()
        };
        const service = new inventory_balance_service_1.InventoryBalanceService(repository);
        await service.onModuleInit();
        (0, vitest_1.expect)(service.listShopItemBalances().find((item) => item.id === "rusty-knife")?.price).toBe(450);
    });
    (0, vitest_1.it)("updates starter item prices", async () => {
        const repository = {
            listShopItemBalances: vitest_1.vi.fn().mockResolvedValue([]),
            upsertShopItemBalance: vitest_1.vi.fn()
        };
        const service = new inventory_balance_service_1.InventoryBalanceService(repository);
        const result = await service.updateShopItemBalances([
            {
                id: "rusty-knife",
                price: 450
            }
        ]);
        (0, vitest_1.expect)(result.find((item) => item.id === "rusty-knife")?.price).toBe(450);
        (0, vitest_1.expect)(repository.upsertShopItemBalance).toHaveBeenCalledWith({
            itemId: "rusty-knife",
            price: 450
        });
    });
    (0, vitest_1.it)("rejects invalid prices", async () => {
        const service = new inventory_balance_service_1.InventoryBalanceService({
            listShopItemBalances: vitest_1.vi.fn().mockResolvedValue([]),
            upsertShopItemBalance: vitest_1.vi.fn()
        });
        await (0, vitest_1.expect)(service.updateShopItemBalances([
            {
                id: "rusty-knife",
                price: 0
            }
        ])).rejects.toThrowError(/price/);
    });
});
