import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import type {
  CrimeBalanceRecord,
  CrimeBalanceRepository
} from "../application/crime-balance.repository";

interface PrismaCrimeBalanceClient {
  crimeBalance: {
    findMany(args: { orderBy: { crimeId: "asc" | "desc" } }): Promise<CrimeBalanceRecord[]>;
    upsert(args: {
      where: { crimeId: string };
      create: CrimeBalanceRecord;
      update: Omit<CrimeBalanceRecord, "crimeId">;
    }): Promise<CrimeBalanceRecord>;
  };
}

@Injectable()
export class PrismaCrimeBalanceRepository implements CrimeBalanceRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async listCrimeBalances(): Promise<CrimeBalanceRecord[]> {
    const prismaClient = this.prismaService as unknown as PrismaCrimeBalanceClient;

    return prismaClient.crimeBalance.findMany({
      orderBy: {
        crimeId: "asc"
      }
    });
  }

  async upsertCrimeBalance(balance: CrimeBalanceRecord): Promise<CrimeBalanceRecord> {
    const prismaClient = this.prismaService as unknown as PrismaCrimeBalanceClient;

    return prismaClient.crimeBalance.upsert({
      where: {
        crimeId: balance.crimeId
      },
      create: balance,
      update: {
        name: balance.name,
        unlockLevel: balance.unlockLevel,
        difficulty: balance.difficulty,
        energyCost: balance.energyCost,
        successRate: balance.successRate,
        cashRewardMin: balance.cashRewardMin,
        cashRewardMax: balance.cashRewardMax,
        respectReward: balance.respectReward
      }
    });
  }
}
