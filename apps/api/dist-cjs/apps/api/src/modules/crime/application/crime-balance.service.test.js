"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const crime_catalog_1 = require("../domain/crime.catalog");
const crime_balance_service_1 = require("./crime-balance.service");
(0, vitest_1.describe)("CrimeBalanceService", () => {
    (0, vitest_1.afterEach)(() => {
        (0, crime_catalog_1.resetStarterCrimeCatalog)();
    });
    (0, vitest_1.it)("hydrates persisted crime balances on module init", async () => {
        const repository = {
            listCrimeBalances: vitest_1.vi.fn().mockResolvedValue([
                {
                    crimeId: "pickpocket",
                    energyCost: 12,
                    successRate: 0.7,
                    cashRewardMin: 150,
                    cashRewardMax: 240,
                    respectReward: 2
                }
            ]),
            upsertCrimeBalance: vitest_1.vi.fn()
        };
        const service = new crime_balance_service_1.CrimeBalanceService(repository);
        await service.onModuleInit();
        (0, vitest_1.expect)(service.listCrimeBalances().find((crime) => crime.id === "pickpocket")).toMatchObject({
            energyCost: 12,
            successRate: 0.7,
            minReward: 150,
            maxReward: 240,
            respectReward: 2
        });
    });
    (0, vitest_1.it)("updates editable crime values", async () => {
        const repository = {
            listCrimeBalances: vitest_1.vi.fn().mockResolvedValue([]),
            upsertCrimeBalance: vitest_1.vi.fn()
        };
        const service = new crime_balance_service_1.CrimeBalanceService(repository);
        const result = await service.updateCrimeBalances([
            {
                id: "pickpocket",
                energyCost: 12,
                successRate: 0.7,
                minReward: 150,
                maxReward: 240,
                respectReward: 2
            }
        ]);
        (0, vitest_1.expect)(result.find((crime) => crime.id === "pickpocket")).toMatchObject({
            energyCost: 12,
            successRate: 0.7,
            minReward: 150,
            maxReward: 240,
            respectReward: 2
        });
        (0, vitest_1.expect)(repository.upsertCrimeBalance).toHaveBeenCalledWith({
            crimeId: "pickpocket",
            energyCost: 12,
            successRate: 0.7,
            cashRewardMin: 150,
            cashRewardMax: 240,
            respectReward: 2
        });
    });
    (0, vitest_1.it)("rejects invalid reward ranges", async () => {
        const service = new crime_balance_service_1.CrimeBalanceService({
            listCrimeBalances: vitest_1.vi.fn().mockResolvedValue([]),
            upsertCrimeBalance: vitest_1.vi.fn()
        });
        await (0, vitest_1.expect)(service.updateCrimeBalances([
            {
                id: "pickpocket",
                minReward: 300,
                maxReward: 200
            }
        ])).rejects.toThrowError(/minReward/);
    });
});
