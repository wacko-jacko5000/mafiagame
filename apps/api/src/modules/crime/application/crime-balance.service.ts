import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";

import {
  applyCrimeBalanceOverride,
  getCrimeById,
  starterCrimeCatalog
} from "../domain/crime.catalog";
import type { CrimeDefinition } from "../domain/crime.types";
import {
  CRIME_BALANCE_REPOSITORY,
  type CrimeBalanceRepository
} from "./crime-balance.repository";

export interface UpdateCrimeBalanceInput {
  id: string;
  energyCost?: number;
  successRate?: number;
  cashRewardMin?: number;
  cashRewardMax?: number;
  respectReward?: number;
}

function cloneCrimeDefinition(crime: CrimeDefinition): CrimeDefinition {
  return {
    ...crime,
    failureConsequence: { ...crime.failureConsequence }
  };
}

function assertPositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new BadRequestException(`${fieldName} must be a positive whole number.`);
  }
}

function assertNonNegativeInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new BadRequestException(`${fieldName} must be a non-negative whole number.`);
  }
}

@Injectable()
export class CrimeBalanceService implements OnModuleInit {
  constructor(
    @Inject(CRIME_BALANCE_REPOSITORY)
    private readonly crimeBalanceRepository: CrimeBalanceRepository
  ) {}

  async onModuleInit(): Promise<void> {
    const persistedBalances = await this.crimeBalanceRepository.listCrimeBalances();

    for (const balance of persistedBalances) {
      applyCrimeBalanceOverride(balance.crimeId, {
        energyCost: balance.energyCost,
        successRate: balance.successRate,
        cashRewardMin: balance.cashRewardMin,
        cashRewardMax: balance.cashRewardMax,
        respectReward: balance.respectReward
      });
    }
  }

  listCrimeBalances(): CrimeDefinition[] {
    return starterCrimeCatalog.map(cloneCrimeDefinition);
  }

  async updateCrimeBalances(
    updates: readonly UpdateCrimeBalanceInput[]
  ): Promise<CrimeDefinition[]> {
    for (const update of updates) {
      const crime = getCrimeById(update.id);

      if (!crime) {
        throw new NotFoundException(`Crime "${update.id}" was not found.`);
      }

      const nextCrime: CrimeDefinition = {
        ...crime,
        energyCost: update.energyCost ?? crime.energyCost,
        successRate: update.successRate ?? crime.successRate,
        cashRewardMin: update.cashRewardMin ?? crime.cashRewardMin,
        cashRewardMax: update.cashRewardMax ?? crime.cashRewardMax,
        respectReward: update.respectReward ?? crime.respectReward
      };

      assertPositiveInteger(nextCrime.energyCost, `Crime "${crime.id}" energyCost`);

      if (
        typeof nextCrime.successRate !== "number" ||
        Number.isNaN(nextCrime.successRate) ||
        nextCrime.successRate < 0 ||
        nextCrime.successRate > 1
      ) {
        throw new BadRequestException(
          `Crime "${crime.id}" successRate must be between 0 and 1.`
        );
      }

      assertNonNegativeInteger(
        nextCrime.cashRewardMin,
        `Crime "${crime.id}" cashRewardMin`
      );
      assertNonNegativeInteger(
        nextCrime.cashRewardMax,
        `Crime "${crime.id}" cashRewardMax`
      );
      assertNonNegativeInteger(
        nextCrime.respectReward,
        `Crime "${crime.id}" respectReward`
      );

      if (nextCrime.cashRewardMin > nextCrime.cashRewardMax) {
        throw new BadRequestException(
          `Crime "${crime.id}" cashRewardMin must be less than or equal to cashRewardMax.`
        );
      }

      await this.crimeBalanceRepository.upsertCrimeBalance({
        crimeId: crime.id,
        energyCost: nextCrime.energyCost,
        successRate: nextCrime.successRate,
        cashRewardMin: nextCrime.cashRewardMin,
        cashRewardMax: nextCrime.cashRewardMax,
        respectReward: nextCrime.respectReward
      });

      applyCrimeBalanceOverride(crime.id, {
        energyCost: nextCrime.energyCost,
        successRate: nextCrime.successRate,
        cashRewardMin: nextCrime.cashRewardMin,
        cashRewardMax: nextCrime.cashRewardMax,
        respectReward: nextCrime.respectReward
      });
    }

    return this.listCrimeBalances();
  }
}
