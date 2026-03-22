import { describe, expect, it, vi } from "vitest";

import type { StickyMenuRepository } from "./sticky-menu.repository";
import { StickyMenuService } from "./sticky-menu.service";

describe("StickyMenuService", () => {
  it("returns the default config when persistence has no row yet", async () => {
    const repository = {
      getConfig: vi.fn().mockResolvedValue(null),
      upsertConfig: vi.fn()
    } satisfies StickyMenuRepository;

    const service = new StickyMenuService(repository);
    const config = await service.getConfig();

    expect(config.primaryItems).toEqual(["home", "crimes", "missions", "shop", "more"]);
    expect(config.moreItems).toContain("inventory");
    expect(config.header.resourceKeys).toEqual(["cash", "respect"]);
  });

  it("rejects duplicate or unsafe item placement", async () => {
    const repository = {
      getConfig: vi.fn(),
      upsertConfig: vi.fn()
    } satisfies StickyMenuRepository;

    const service = new StickyMenuService(repository);

    await expect(
      service.updateConfig({
        header: {
          enabled: true,
          resourceKeys: ["cash", "respect"]
        },
        primaryItems: ["home", "crimes", "inventory", "shop", "more"],
        moreItems: ["inventory", "activity"]
      })
    ).rejects.toMatchObject({
      status: 400
    });
  });

  it("persists a valid sticky menu layout", async () => {
    const repository = {
      getConfig: vi.fn(),
      upsertConfig: vi.fn().mockResolvedValue({
        id: "default",
        headerEnabled: true,
        headerResourceKeys: ["cash", "respect", "energy"],
        primaryItems: ["home", "inventory", "missions", "shop", "more"],
        moreItems: ["activity", "market", "leaderboard"],
        createdAt: new Date("2026-03-22T13:30:00.000Z"),
        updatedAt: new Date("2026-03-22T13:35:00.000Z")
      })
    } satisfies StickyMenuRepository;

    const service = new StickyMenuService(repository);
    const config = await service.updateConfig({
      header: {
        enabled: true,
        resourceKeys: ["cash", "respect", "energy"]
      },
      primaryItems: ["home", "inventory", "missions", "shop", "more"],
      moreItems: ["activity", "market", "leaderboard"]
    });

    expect(repository.upsertConfig).toHaveBeenCalledWith({
      headerEnabled: true,
      headerResourceKeys: ["cash", "respect", "energy"],
      primaryItems: ["home", "inventory", "missions", "shop", "more"],
      moreItems: ["activity", "market", "leaderboard"]
    });
    expect(config.header.resourceKeys).toEqual(["cash", "respect", "energy"]);
    expect(config.moreItems).toEqual(["activity", "market", "leaderboard"]);
  });
});
