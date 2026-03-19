import { describe, expect, it, vi } from "vitest";

import type { TerritoryRepository } from "./territory.repository";
import { TerritoryBalanceService } from "./territory-balance.service";

function createTerritoryRepositoryMock(): TerritoryRepository {
  return {
    listDistricts: vi.fn(),
    findDistrictById: vi.fn(),
    updateDistrictBalance: vi.fn(),
    claimDistrict: vi.fn(),
    claimDistrictPayout: vi.fn(),
    findActiveWarByDistrictId: vi.fn(),
    findWarById: vi.fn(),
    startWar: vi.fn(),
    resolveWar: vi.fn()
  };
}

describe("TerritoryBalanceService", () => {
  it("updates district payout values through the repository", async () => {
    const repository = createTerritoryRepositoryMock();
    const districtId = crypto.randomUUID();

    vi.mocked(repository.findDistrictById).mockResolvedValue({
      id: districtId,
      name: "Downtown",
      payoutAmount: 1000,
      payoutCooldownMinutes: 60,
      createdAt: new Date(),
      control: null,
      activeWar: null
    });
    vi.mocked(repository.updateDistrictBalance).mockResolvedValue({
      id: districtId,
      name: "Downtown",
      payoutAmount: 1250,
      payoutCooldownMinutes: 90,
      createdAt: new Date(),
      control: null,
      activeWar: null
    });
    vi.mocked(repository.listDistricts).mockResolvedValue([
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

    const service = new TerritoryBalanceService(repository);
    const result = await service.updateDistrictBalances([
      {
        id: districtId,
        payoutAmount: 1250,
        payoutCooldownMinutes: 90
      }
    ]);

    expect(repository.updateDistrictBalance).toHaveBeenCalledWith({
      districtId,
      payoutAmount: 1250,
      payoutCooldownMinutes: 90
    });
    expect(result[0]).toMatchObject({
      payoutAmount: 1250,
      payoutCooldownMinutes: 90
    });
  });

  it("rejects invalid cooldown values", async () => {
    const repository = createTerritoryRepositoryMock();
    const districtId = crypto.randomUUID();

    vi.mocked(repository.findDistrictById).mockResolvedValue({
      id: districtId,
      name: "Downtown",
      payoutAmount: 1000,
      payoutCooldownMinutes: 60,
      createdAt: new Date(),
      control: null,
      activeWar: null
    });

    const service = new TerritoryBalanceService(repository);

    await expect(
      service.updateDistrictBalances([
        {
          id: districtId,
          payoutCooldownMinutes: 0
        }
      ])
    ).rejects.toMatchObject({
      status: 400
    });
  });
});
