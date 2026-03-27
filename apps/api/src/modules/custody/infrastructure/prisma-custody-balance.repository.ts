import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type {
  CustodyBalanceRepository,
  CustodyBuyoutConfigRecord,
  CustodyBuyoutLevelRecord
} from "../application/custody-balance.repository";

@Injectable()
export class PrismaCustodyBalanceRepository implements CustodyBalanceRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async listConfigs(): Promise<CustodyBuyoutConfigRecord[]> {
    return this.prismaService.custodyBuyoutConfig.findMany();
  }

  async upsertConfig(config: CustodyBuyoutConfigRecord): Promise<CustodyBuyoutConfigRecord> {
    return this.prismaService.custodyBuyoutConfig.upsert({
      where: {
        statusType: config.statusType
      },
      create: config,
      update: {
        escalationEnabled: config.escalationEnabled,
        escalationPercentage: config.escalationPercentage,
        minimumPrice: config.minimumPrice,
        roundingRule: config.roundingRule
      }
    });
  }

  async listLevelBalances(): Promise<CustodyBuyoutLevelRecord[]> {
    return this.prismaService.custodyBuyoutLevelBalance.findMany();
  }

  async upsertLevelBalance(
    balance: CustodyBuyoutLevelRecord
  ): Promise<CustodyBuyoutLevelRecord> {
    return this.prismaService.custodyBuyoutLevelBalance.upsert({
      where: {
        statusType_level: {
          statusType: balance.statusType,
          level: balance.level
        }
      },
      create: balance,
      update: {
        basePricePerMinute: balance.basePricePerMinute
      }
    });
  }
}
