import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";

import {
  applyShopItemBalanceOverride,
  getShopItemById,
  starterShopItemCatalog
} from "../domain/inventory.catalog";
import type { ShopItemDefinition } from "../domain/inventory.types";
import {
  INVENTORY_BALANCE_REPOSITORY,
  type InventoryBalanceRepository
} from "./inventory-balance.repository";

export interface UpdateShopItemBalanceInput {
  id: string;
  price: number;
}

@Injectable()
export class InventoryBalanceService implements OnModuleInit {
  constructor(
    @Inject(INVENTORY_BALANCE_REPOSITORY)
    private readonly inventoryBalanceRepository: InventoryBalanceRepository
  ) {}

  async onModuleInit(): Promise<void> {
    const persistedBalances = await this.inventoryBalanceRepository.listShopItemBalances();

    for (const balance of persistedBalances) {
      applyShopItemBalanceOverride(balance.itemId, {
        price: balance.price
      });
    }
  }

  listShopItemBalances(): ShopItemDefinition[] {
    return starterShopItemCatalog.map((item) =>
      item.delivery === "inventory"
        ? {
            ...item,
            delivery: "inventory",
            consumableEffects: null,
            weaponStats: item.weaponStats ? { ...item.weaponStats } : null,
            armorStats: item.armorStats ? { ...item.armorStats } : null
          }
        : {
            ...item,
            weaponStats: null,
            armorStats: null,
            consumableEffects: item.consumableEffects.map((effect) => ({ ...effect }))
          }
    );
  }

  async updateShopItemBalances(
    updates: readonly UpdateShopItemBalanceInput[]
    ): Promise<ShopItemDefinition[]> {
    for (const update of updates) {
      const item = getShopItemById(update.id);

      if (!item) {
        throw new NotFoundException(`Shop item "${update.id}" was not found.`);
      }

      if (!Number.isInteger(update.price) || update.price <= 0) {
        throw new BadRequestException(
          `Shop item "${update.id}" price must be a positive whole number.`
        );
      }

      await this.inventoryBalanceRepository.upsertShopItemBalance({
        itemId: item.id,
        price: update.price
      });

      applyShopItemBalanceOverride(item.id, {
        price: update.price
      });
    }

    return this.listShopItemBalances();
  }
}
