import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type {
  InventoryBalanceRepository,
  ShopItemBalanceRecord
} from "../application/inventory-balance.repository";

interface PrismaInventoryBalanceClient {
  shopItemBalance: {
    findMany(args: { orderBy: { itemId: "asc" | "desc" } }): Promise<ShopItemBalanceRecord[]>;
    upsert(args: {
      where: { itemId: string };
      create: ShopItemBalanceRecord;
      update: Omit<ShopItemBalanceRecord, "itemId">;
    }): Promise<ShopItemBalanceRecord>;
  };
}

@Injectable()
export class PrismaInventoryBalanceRepository implements InventoryBalanceRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async listShopItemBalances(): Promise<ShopItemBalanceRecord[]> {
    const prismaClient = this.prismaService as unknown as PrismaInventoryBalanceClient;

    return prismaClient.shopItemBalance.findMany({
      orderBy: {
        itemId: "asc"
      }
    });
  }

  async upsertShopItemBalance(balance: ShopItemBalanceRecord): Promise<ShopItemBalanceRecord> {
    const prismaClient = this.prismaService as unknown as PrismaInventoryBalanceClient;

    return prismaClient.shopItemBalance.upsert({
      where: {
        itemId: balance.itemId
      },
      create: balance,
      update: {
        name: balance.name,
        type: balance.type,
        category: balance.category,
        delivery: balance.delivery,
        equipSlot: balance.equipSlot,
        unlockLevel: balance.unlockLevel,
        respectBonus: balance.respectBonus,
        parkingSlots: balance.parkingSlots,
        damageBonus: balance.damageBonus,
        damageReduction: balance.damageReduction,
        resourceEffectResource: balance.resourceEffectResource,
        resourceEffectAmount: balance.resourceEffectAmount,
        archived: balance.archived,
        price: balance.price
      }
    });
  }
}
