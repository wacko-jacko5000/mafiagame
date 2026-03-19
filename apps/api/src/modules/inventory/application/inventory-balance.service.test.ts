import { afterEach, describe, expect, it, vi } from "vitest";

import { resetStarterItemCatalog } from "../domain/inventory.catalog";
import type { InventoryBalanceRepository } from "./inventory-balance.repository";
import { InventoryBalanceService } from "./inventory-balance.service";

describe("InventoryBalanceService", () => {
  afterEach(() => {
    resetStarterItemCatalog();
  });

  it("hydrates persisted shop item prices on module init", async () => {
    const repository = {
      listShopItemBalances: vi.fn().mockResolvedValue([
        {
          itemId: "rusty-knife",
          price: 450
        }
      ]),
      upsertShopItemBalance: vi.fn()
    } satisfies InventoryBalanceRepository;

    const service = new InventoryBalanceService(repository);

    await service.onModuleInit();

    expect(service.listShopItemBalances().find((item) => item.id === "rusty-knife")?.price).toBe(
      450
    );
  });

  it("updates starter item prices", async () => {
    const repository = {
      listShopItemBalances: vi.fn().mockResolvedValue([]),
      upsertShopItemBalance: vi.fn()
    } satisfies InventoryBalanceRepository;

    const service = new InventoryBalanceService(repository);

    const result = await service.updateShopItemBalances([
      {
        id: "rusty-knife",
        price: 450
      }
    ]);

    expect(result.find((item) => item.id === "rusty-knife")?.price).toBe(450);
    expect(repository.upsertShopItemBalance).toHaveBeenCalledWith({
      itemId: "rusty-knife",
      price: 450
    });
  });

  it("rejects invalid prices", async () => {
    const service = new InventoryBalanceService({
      listShopItemBalances: vi.fn().mockResolvedValue([]),
      upsertShopItemBalance: vi.fn()
    });

    await expect(
      service.updateShopItemBalances([
        {
          id: "rusty-knife",
          price: 0
        }
      ])
    ).rejects.toThrowError(/price/);
  });
});
