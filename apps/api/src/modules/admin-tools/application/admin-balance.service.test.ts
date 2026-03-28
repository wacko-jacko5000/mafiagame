import { describe, expect, it, vi } from "vitest";

import type { AdminBalanceAuditRepository } from "./admin-balance-audit.repository";
import { CrimeBalanceService } from "../../crime/application/crime-balance.service";
import { CustodyBalanceService } from "../../custody/application/custody-balance.service";
import { InventoryBalanceService } from "../../inventory/application/inventory-balance.service";
import { TerritoryBalanceService } from "../../territory/application/territory-balance.service";
import { AdminBalanceService } from "./admin-balance.service";

function createCustodyBalanceServiceMock() {
  return {
    listStatusConfigs: vi.fn().mockReturnValue([
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
    updateBalances: vi.fn()
  } as unknown as CustodyBalanceService;
}

describe("AdminBalanceService", () => {
  it("returns all configured balance sections", async () => {
    const auditRepository = {
      createEntries: vi.fn(),
      listEntries: vi.fn()
    } satisfies AdminBalanceAuditRepository;

    const service = new AdminBalanceService(
      auditRepository,
      {
        listCrimeBalances: vi.fn().mockReturnValue([
          {
            id: "pickpocket",
            name: "Pickpocket",
            unlockLevel: 1,
            difficulty: "easy",
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
      } as unknown as CrimeBalanceService,
      {
        listDistrictBalances: vi.fn().mockResolvedValue([
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
      } as unknown as TerritoryBalanceService,
      {
        listShopItemBalances: vi.fn().mockReturnValue([
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
      } as unknown as InventoryBalanceService,
      createCustodyBalanceServiceMock()
    );

    const result = await service.getAllSections();

    expect(result.map((section) => section.section)).toEqual([
      "crimes",
      "districts",
      "shop-items",
      "custody"
    ]);
  });

  it("validates crime update payloads before delegating", async () => {
    const auditRepository = {
      createEntries: vi.fn(),
      listEntries: vi.fn()
    } satisfies AdminBalanceAuditRepository;
    const crimeBalanceService = {
      listCrimeBalances: vi.fn().mockReturnValue([]),
      updateCrimeBalances: vi.fn()
    } as unknown as CrimeBalanceService;

    const service = new AdminBalanceService(
      auditRepository,
      crimeBalanceService,
      {
        listDistrictBalances: vi.fn(),
        updateDistrictBalances: vi.fn()
      } as unknown as TerritoryBalanceService,
      {
        listShopItemBalances: vi.fn(),
        updateShopItemBalances: vi.fn()
      } as unknown as InventoryBalanceService,
      createCustodyBalanceServiceMock()
    );

    await expect(
      service.updateSection("crimes", {
        crimes: [{ id: "pickpocket" }]
      }, null)
    ).rejects.toMatchObject({
      status: 400
    });
    expect(vi.mocked(crimeBalanceService.updateCrimeBalances)).not.toHaveBeenCalled();
  });

  it("records audit entries for crime updates", async () => {
    const auditRepository = {
      createEntries: vi.fn(),
      listEntries: vi.fn()
    } satisfies AdminBalanceAuditRepository;
    const crimeBalanceService = {
      listCrimeBalances: vi
        .fn()
        .mockReturnValueOnce([
          {
            id: "pickpocket",
            name: "Pickpocket",
            unlockLevel: 1,
            difficulty: "easy",
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
            unlockLevel: 1,
            difficulty: "easy",
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
      updateCrimeBalances: vi.fn().mockResolvedValue(undefined)
    } as unknown as CrimeBalanceService;

    const service = new AdminBalanceService(
      auditRepository,
      crimeBalanceService,
      {
        listDistrictBalances: vi.fn(),
        updateDistrictBalances: vi.fn()
      } as unknown as TerritoryBalanceService,
      {
        listShopItemBalances: vi.fn(),
        updateShopItemBalances: vi.fn()
      } as unknown as InventoryBalanceService,
      createCustodyBalanceServiceMock()
    );

    await service.updateSection(
      "crimes",
      {
        crimes: [
          {
            id: "pickpocket",
            energyCost: 12
          }
        ]
      },
      "account-1"
    );

    expect(auditRepository.createEntries).toHaveBeenCalledWith([
      {
        section: "crimes",
        targetId: "pickpocket",
        changedByAccountId: "account-1",
        previousValue: {
          id: "pickpocket",
          name: "Pickpocket",
          unlockLevel: 1,
          difficulty: "easy",
          energyCost: 10,
          successRate: 0.75,
          cashRewardMin: 120,
          cashRewardMax: 220,
          respectReward: 1
        },
        newValue: {
          id: "pickpocket",
          name: "Pickpocket",
          unlockLevel: 1,
          difficulty: "easy",
          energyCost: 12,
          successRate: 0.7,
          cashRewardMin: 150,
          cashRewardMax: 240,
          respectReward: 2
        }
      }
    ]);
  });

  it("creates a custom crime and records the creation in the audit log", async () => {
    const auditRepository = {
      createEntries: vi.fn(),
      listEntries: vi.fn()
    } satisfies AdminBalanceAuditRepository;
    const crimeBalanceService = {
      listCrimeBalances: vi
        .fn()
        .mockReturnValueOnce([
          {
            id: "pickpocket",
            name: "Pickpocket",
            unlockLevel: 1,
            difficulty: "easy",
            energyCost: 10,
            successRate: 0.75,
            minReward: 120,
            maxReward: 220,
            respectReward: 1,
            failureConsequence: {
              type: "none"
            }
          },
          {
            id: "warehouse-tipoff",
            name: "Warehouse Tipoff",
            unlockLevel: 6,
            difficulty: "hard",
            energyCost: 18,
            successRate: 0.5,
            minReward: 1800,
            maxReward: 2600,
            respectReward: 14,
            failureConsequence: {
              type: "jail",
              durationMinutes: 25
            }
          }
        ]),
      createCrime: vi.fn().mockResolvedValue({
        id: "warehouse-tipoff",
        name: "Warehouse Tipoff",
        unlockLevel: 6,
        difficulty: "hard",
        energyCost: 18,
        successRate: 0.5,
        minReward: 1800,
        maxReward: 2600,
        respectReward: 14,
        failureConsequence: {
          type: "jail",
          durationMinutes: 25
        }
      })
    } as unknown as CrimeBalanceService;

    const service = new AdminBalanceService(
      auditRepository,
      crimeBalanceService,
      {
        listDistrictBalances: vi.fn(),
        updateDistrictBalances: vi.fn()
      } as unknown as TerritoryBalanceService,
      {
        listShopItemBalances: vi.fn(),
        updateShopItemBalances: vi.fn()
      } as unknown as InventoryBalanceService,
      createCustodyBalanceServiceMock()
    );

    const result = await service.createCrime(
      {
        id: "warehouse-tipoff",
        name: "Warehouse Tipoff",
        unlockLevel: 6,
        difficulty: "hard",
        cashRewardMin: 1800,
        cashRewardMax: 2600,
        respectReward: 14
      },
      "account-7"
    );

    expect(vi.mocked(crimeBalanceService.createCrime)).toHaveBeenCalledWith({
      id: "warehouse-tipoff",
      name: "Warehouse Tipoff",
      unlockLevel: 6,
      difficulty: "hard",
      cashRewardMin: 1800,
      cashRewardMax: 2600,
      respectReward: 14
    });
    expect(result).toMatchObject({
      section: "crimes",
      entries: expect.arrayContaining([
        expect.objectContaining({
          id: "warehouse-tipoff",
          name: "Warehouse Tipoff",
          unlockLevel: 6,
          difficulty: "hard",
          cashRewardMin: 1800,
          cashRewardMax: 2600,
          respectReward: 14
        })
      ])
    });
    expect(auditRepository.createEntries).toHaveBeenCalledWith([
      {
        section: "crimes",
        targetId: "warehouse-tipoff",
        changedByAccountId: "account-7",
        previousValue: {
          id: "warehouse-tipoff",
          name: null,
          unlockLevel: null,
          difficulty: null,
          energyCost: null,
          successRate: null,
          cashRewardMin: null,
          cashRewardMax: null,
          respectReward: null
        },
        newValue: {
          id: "warehouse-tipoff",
          name: "Warehouse Tipoff",
          unlockLevel: 6,
          difficulty: "hard",
          energyCost: 18,
          successRate: 0.5,
          cashRewardMin: 1800,
          cashRewardMax: 2600,
          respectReward: 14
        }
      }
    ]);
  });

  it("lists audit entries with query validation", async () => {
    const auditRepository = {
      createEntries: vi.fn(),
      listEntries: vi.fn().mockResolvedValue([
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
    } satisfies AdminBalanceAuditRepository;

    const service = new AdminBalanceService(
      auditRepository,
      {
        listCrimeBalances: vi.fn().mockReturnValue([])
      } as unknown as CrimeBalanceService,
      {
        listDistrictBalances: vi.fn().mockResolvedValue([])
      } as unknown as TerritoryBalanceService,
      {
        listShopItemBalances: vi.fn().mockReturnValue([])
      } as unknown as InventoryBalanceService,
      createCustodyBalanceServiceMock()
    );

    const result = await service.getAuditLog({
      section: "shop-items",
      limit: "10"
    });

    expect(auditRepository.listEntries).toHaveBeenCalledWith({
      section: "shop-items",
      limit: 10
    });
    expect(result[0]).toMatchObject({
      section: "shop-items",
      targetId: "rusty-knife",
      changedByAccountId: null,
      changedAt: "2026-03-18T20:00:00.000Z"
    });
  });
});
