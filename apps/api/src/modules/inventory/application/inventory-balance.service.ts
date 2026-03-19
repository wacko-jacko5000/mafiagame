import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";

import {
  applyShopItemBalanceOverride,
  getItemById,
  starterItemCatalog
} from "../domain/inventory.catalog";
import type { ItemDefinition } from "../domain/inventory.types";
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

  listShopItemBalances(): ItemDefinition[] {
    return starterItemCatalog.map((item) => ({ ...item }));
  }

  async updateShopItemBalances(
    updates: readonly UpdateShopItemBalanceInput[]
  ): Promise<ItemDefinition[]> {
    for (const update of updates) {
      const item = getItemById(update.id);

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
