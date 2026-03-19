import { describe, expect, it, vi } from "vitest";

import type { AdminBalanceAuditRepository } from "./admin-balance-audit.repository";
import { CrimeBalanceService } from "../../crime/application/crime-balance.service";
import { InventoryBalanceService } from "../../inventory/application/inventory-balance.service";
import { TerritoryBalanceService } from "../../territory/application/territory-balance.service";
import { AdminBalanceService } from "./admin-balance.service";

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
            energyCost: 10,
            successRate: 0.75,
            cashRewardMin: 120,
            cashRewardMax: 220,
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
            name: "Rusty Knife",
            type: "weapon",
            price: 400,
            equipSlot: "weapon",
            combatAttackBonus: 4,
            combatDefenseBonus: 0
          }
        ])
      } as unknown as InventoryBalanceService
    );

    const result = await service.getAllSections();

    expect(result.map((section) => section.section)).toEqual([
      "crimes",
      "districts",
      "shop-items"
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
      } as unknown as InventoryBalanceService
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
            energyCost: 10,
            successRate: 0.75,
            cashRewardMin: 120,
            cashRewardMax: 220,
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
            cashRewardMin: 150,
            cashRewardMax: 240,
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
      } as unknown as InventoryBalanceService
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
      } as unknown as InventoryBalanceService
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
