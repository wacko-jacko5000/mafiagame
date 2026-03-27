"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const territory_balance_service_1 = require("./territory-balance.service");
function createTerritoryRepositoryMock() {
    return {
        listDistricts: vitest_1.vi.fn(),
        findDistrictById: vitest_1.vi.fn(),
        updateDistrictBalance: vitest_1.vi.fn(),
        claimDistrict: vitest_1.vi.fn(),
        claimDistrictPayout: vitest_1.vi.fn(),
        findActiveWarByDistrictId: vitest_1.vi.fn(),
        findWarById: vitest_1.vi.fn(),
        startWar: vitest_1.vi.fn(),
        resolveWar: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("TerritoryBalanceService", () => {
    (0, vitest_1.it)("updates district payout values through the repository", async () => {
        const repository = createTerritoryRepositoryMock();
        const districtId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findDistrictById).mockResolvedValue({
            id: districtId,
            name: "Downtown",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date(),
            control: null,
            activeWar: null
        });
        vitest_1.vi.mocked(repository.updateDistrictBalance).mockResolvedValue({
            id: districtId,
            name: "Downtown",
            payoutAmount: 1250,
            payoutCooldownMinutes: 90,
            createdAt: new Date(),
            control: null,
            activeWar: null
        });
        vitest_1.vi.mocked(repository.listDistricts).mockResolvedValue([
            {
                id: districtId,
                name: "Downtown",
                payoutAmount: 1250,
                payoutCooldownMinutes: 90,
                createdAt: new Date(),
                control: null,
                activeWar: null
            }
        ]);
        const service = new territory_balance_service_1.TerritoryBalanceService(repository);
        const result = await service.updateDistrictBalances([
            {
                id: districtId,
                payoutAmount: 1250,
                payoutCooldownMinutes: 90
            }
        ]);
        (0, vitest_1.expect)(repository.updateDistrictBalance).toHaveBeenCalledWith({
            districtId,
            payoutAmount: 1250,
            payoutCooldownMinutes: 90
        });
        (0, vitest_1.expect)(result[0]).toMatchObject({
            payoutAmount: 1250,
            payoutCooldownMinutes: 90
        });
    });
    (0, vitest_1.it)("rejects invalid cooldown values", async () => {
        const repository = createTerritoryRepositoryMock();
        const districtId = crypto.randomUUID();
        vitest_1.vi.mocked(repository.findDistrictById).mockResolvedValue({
            id: districtId,
            name: "Downtown",
            payoutAmount: 1000,
            payoutCooldownMinutes: 60,
            createdAt: new Date(),
            control: null,
            activeWar: null
        });
        const service = new territory_balance_service_1.TerritoryBalanceService(repository);
        await (0, vitest_1.expect)(service.updateDistrictBalances([
            {
                id: districtId,
                payoutCooldownMinutes: 0
            }
        ])).rejects.toMatchObject({
            status: 400
        });
    });
});
