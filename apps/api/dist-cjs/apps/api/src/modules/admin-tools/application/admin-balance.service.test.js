"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const admin_balance_service_1 = require("./admin-balance.service");
function createCustodyBalanceServiceMock() {
    return {
        listStatusConfigs: vitest_1.vi.fn().mockReturnValue([
            {
                statusType: "jail",
                label: "Jail",
                escalationEnabled: true,
                escalationPercentage: 0.1,
                minimumPrice: null,
                roundingRule: "ceil",
                levels: [
                    {
                        level: 1,
                        rank: "Scum",
                        basePricePerMinute: 100
                    }
                ]
            },
            {
                statusType: "hospital",
                label: "Hospital",
                escalationEnabled: true,
                escalationPercentage: 0.1,
                minimumPrice: null,
                roundingRule: "ceil",
                levels: [
                    {
                        level: 1,
                        rank: "Scum",
                        basePricePerMinute: 125
                    }
                ]
            }
        ]),
        updateBalances: vitest_1.vi.fn()
    };
}
(0, vitest_1.describe)("AdminBalanceService", () => {
    (0, vitest_1.it)("returns all configured balance sections", async () => {
        const auditRepository = {
            createEntries: vitest_1.vi.fn(),
            listEntries: vitest_1.vi.fn()
        };
        const service = new admin_balance_service_1.AdminBalanceService(auditRepository, {
            listCrimeBalances: vitest_1.vi.fn().mockReturnValue([
                {
                    id: "pickpocket",
                    name: "Pickpocket",
                    energyCost: 10,
                    successRate: 0.75,
                    minReward: 120,
                    maxReward: 220,
                    respectReward: 1,
                    failureConsequence: {
                        type: "none"
                    }
                }
            ])
        }, {
            listDistrictBalances: vitest_1.vi.fn().mockResolvedValue([
                {
                    id: crypto.randomUUID(),
                    name: "Downtown",
                    payoutAmount: 1000,
                    payoutCooldownMinutes: 60,
                    createdAt: new Date(),
                    control: null,
                    activeWar: null
                }
            ])
        }, {
            listShopItemBalances: vitest_1.vi.fn().mockReturnValue([
                {
                    id: "rusty-knife",
                    name: "Glock 17",
                    type: "weapon",
                    price: 400,
                    equipSlot: "weapon",
                    weaponStats: {
                        damageBonus: 4
                    },
                    armorStats: null
                }
            ])
        }, createCustodyBalanceServiceMock());
        const result = await service.getAllSections();
        (0, vitest_1.expect)(result.map((section) => section.section)).toEqual([
            "crimes",
            "districts",
            "shop-items",
            "custody"
        ]);
    });
    (0, vitest_1.it)("validates crime update payloads before delegating", async () => {
        const auditRepository = {
            createEntries: vitest_1.vi.fn(),
            listEntries: vitest_1.vi.fn()
        };
        const crimeBalanceService = {
            listCrimeBalances: vitest_1.vi.fn().mockReturnValue([]),
            updateCrimeBalances: vitest_1.vi.fn()
        };
        const service = new admin_balance_service_1.AdminBalanceService(auditRepository, crimeBalanceService, {
            listDistrictBalances: vitest_1.vi.fn(),
            updateDistrictBalances: vitest_1.vi.fn()
        }, {
            listShopItemBalances: vitest_1.vi.fn(),
            updateShopItemBalances: vitest_1.vi.fn()
        }, createCustodyBalanceServiceMock());
        await (0, vitest_1.expect)(service.updateSection("crimes", {
            crimes: [{ id: "pickpocket" }]
        }, null)).rejects.toMatchObject({
            status: 400
        });
        (0, vitest_1.expect)(vitest_1.vi.mocked(crimeBalanceService.updateCrimeBalances)).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("records audit entries for crime updates", async () => {
        const auditRepository = {
            createEntries: vitest_1.vi.fn(),
            listEntries: vitest_1.vi.fn()
        };
        const crimeBalanceService = {
            listCrimeBalances: vitest_1.vi
                .fn()
                .mockReturnValueOnce([
                {
                    id: "pickpocket",
                    name: "Pickpocket",
                    energyCost: 10,
                    successRate: 0.75,
                    minReward: 120,
                    maxReward: 220,
                    respectReward: 1,
                    failureConsequence: {
                        type: "none"
                    }
                }
            ])
                .mockReturnValueOnce([
                {
                    id: "pickpocket",
                    name: "Pickpocket",
                    energyCost: 12,
                    successRate: 0.7,
                    minReward: 150,
                    maxReward: 240,
                    respectReward: 2,
                    failureConsequence: {
                        type: "none"
                    }
                }
            ]),
            updateCrimeBalances: vitest_1.vi.fn().mockResolvedValue(undefined)
        };
        const service = new admin_balance_service_1.AdminBalanceService(auditRepository, crimeBalanceService, {
            listDistrictBalances: vitest_1.vi.fn(),
            updateDistrictBalances: vitest_1.vi.fn()
        }, {
            listShopItemBalances: vitest_1.vi.fn(),
            updateShopItemBalances: vitest_1.vi.fn()
        }, createCustodyBalanceServiceMock());
        await service.updateSection("crimes", {
            crimes: [
                {
                    id: "pickpocket",
                    energyCost: 12
                }
            ]
        }, "account-1");
        (0, vitest_1.expect)(auditRepository.createEntries).toHaveBeenCalledWith([
            {
                section: "crimes",
                targetId: "pickpocket",
                changedByAccountId: "account-1",
                previousValue: {
                    id: "pickpocket",
                    name: "Pickpocket",
                    energyCost: 10,
                    successRate: 0.75,
                    cashRewardMin: 120,
                    cashRewardMax: 220,
                    respectReward: 1
                },
                newValue: {
                    id: "pickpocket",
                    name: "Pickpocket",
                    energyCost: 12,
                    successRate: 0.7,
                    cashRewardMin: 150,
                    cashRewardMax: 240,
                    respectReward: 2
                }
            }
        ]);
    });
    (0, vitest_1.it)("lists audit entries with query validation", async () => {
        const auditRepository = {
            createEntries: vitest_1.vi.fn(),
            listEntries: vitest_1.vi.fn().mockResolvedValue([
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
                    changedAt: new Date("2026-03-18T20:00:00.000Z")
                }
            ])
        };
        const service = new admin_balance_service_1.AdminBalanceService(auditRepository, {
            listCrimeBalances: vitest_1.vi.fn().mockReturnValue([])
        }, {
            listDistrictBalances: vitest_1.vi.fn().mockResolvedValue([])
        }, {
            listShopItemBalances: vitest_1.vi.fn().mockReturnValue([])
        }, createCustodyBalanceServiceMock());
        const result = await service.getAuditLog({
            section: "shop-items",
            limit: "10"
        });
        (0, vitest_1.expect)(auditRepository.listEntries).toHaveBeenCalledWith({
            section: "shop-items",
            limit: 10
        });
        (0, vitest_1.expect)(result[0]).toMatchObject({
            section: "shop-items",
            targetId: "rusty-knife",
            changedByAccountId: null,
            changedAt: "2026-03-18T20:00:00.000Z"
        });
    });
});
