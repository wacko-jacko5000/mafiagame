import { afterEach, describe, expect, it, vi } from "vitest";

import { resetStarterCrimeCatalog } from "../domain/crime.catalog";
import type { CrimeBalanceRepository } from "./crime-balance.repository";
import { CrimeBalanceService } from "./crime-balance.service";

describe("CrimeBalanceService", () => {
  afterEach(() => {
    resetStarterCrimeCatalog();
  });

  it("hydrates persisted crime balances on module init", async () => {
    const repository = {
      listCrimeBalances: vi.fn().mockResolvedValue([
        {
          crimeId: "pickpocket",
          energyCost: 12,
          successRate: 0.7,
          cashRewardMin: 150,
          cashRewardMax: 240,
          respectReward: 2
        }
      ]),
      upsertCrimeBalance: vi.fn()
    } satisfies CrimeBalanceRepository;

    const service = new CrimeBalanceService(repository);

    await service.onModuleInit();

    expect(service.listCrimeBalances().find((crime) => crime.id === "pickpocket")).toMatchObject({
      energyCost: 12,
      successRate: 0.7,
      minReward: 150,
      maxReward: 240,
      respectReward: 2
    });
  });

  it("updates editable crime values", async () => {
    const repository = {
      listCrimeBalances: vi.fn().mockResolvedValue([]),
      upsertCrimeBalance: vi.fn()
    } satisfies CrimeBalanceRepository;

    const service = new CrimeBalanceService(repository);

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

    expect(result.find((crime) => crime.id === "pickpocket")).toMatchObject({
      energyCost: 12,
      successRate: 0.7,
      minReward: 150,
      maxReward: 240,
      respectReward: 2
    });
    expect(repository.upsertCrimeBalance).toHaveBeenCalledWith({
      crimeId: "pickpocket",
      energyCost: 12,
      successRate: 0.7,
      cashRewardMin: 150,
      cashRewardMax: 240,
      respectReward: 2
    });
  });

  it("rejects invalid reward ranges", async () => {
    const service = new CrimeBalanceService({
      listCrimeBalances: vi.fn().mockResolvedValue([]),
      upsertCrimeBalance: vi.fn()
    });

    await expect(
      service.updateCrimeBalances([
        {
          id: "pickpocket",
          minReward: 300,
          maxReward: 200
        }
      ])
    ).rejects.toThrowError(/minReward/);
  });
});
