import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";

import {
  applyCrimeBalanceOverride,
  buildCrimeDefinition,
  getCrimeById,
  starterCrimeCatalog
} from "../domain/crime.catalog";
import type { CrimeDefinition, CrimeDifficulty } from "../domain/crime.types";
import {
  CRIME_BALANCE_REPOSITORY,
  type CrimeBalanceRepository
} from "./crime-balance.repository";

export interface UpdateCrimeBalanceInput {
  id: string;
  energyCost?: number;
  successRate?: number;
  minReward?: number;
  maxReward?: number;
  cashRewardMin?: number;
  cashRewardMax?: number;
  respectReward?: number;
}

export interface CreateCrimeInput {
  id: string;
  name: string;
  unlockLevel: number;
  difficulty: CrimeDifficulty;
  cashRewardMin: number;
  cashRewardMax: number;
  respectReward: number;
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
  private readonly customCrimeCatalog = new Map<string, CrimeDefinition>();

  constructor(
    @Inject(CRIME_BALANCE_REPOSITORY)
    private readonly crimeBalanceRepository: CrimeBalanceRepository
  ) {}

  async onModuleInit(): Promise<void> {
    const persistedBalances = await this.crimeBalanceRepository.listCrimeBalances();

    for (const balance of persistedBalances) {
      const defaultCrime = getCrimeById(balance.crimeId);

      if (defaultCrime) {
        applyCrimeBalanceOverride(balance.crimeId, {
          energyCost: balance.energyCost,
          successRate: balance.successRate,
          minReward: balance.cashRewardMin,
          maxReward: balance.cashRewardMax,
          respectReward: balance.respectReward
        });
        continue;
      }

      if (!balance.name || balance.unlockLevel === null || !balance.difficulty) {
        continue;
      }

      const customCrime = buildCrimeDefinition({
        id: balance.crimeId,
        name: balance.name,
        unlockLevel: balance.unlockLevel,
        difficulty: balance.difficulty,
        minReward: balance.cashRewardMin,
        maxReward: balance.cashRewardMax,
        respectReward: balance.respectReward
      });

      customCrime.energyCost = balance.energyCost;
      customCrime.successRate = balance.successRate;

      this.customCrimeCatalog.set(customCrime.id, customCrime);
    }
  }

  listCrimeBalances(): CrimeDefinition[] {
    return [...starterCrimeCatalog, ...this.customCrimeCatalog.values()]
      .map(cloneCrimeDefinition)
      .sort(
        (left, right) =>
          left.unlockLevel - right.unlockLevel ||
          left.name.localeCompare(right.name) ||
          left.id.localeCompare(right.id)
      );
  }

  findCrimeById(crimeId: string): CrimeDefinition | null {
    const defaultCrime = getCrimeById(crimeId);

    if (defaultCrime) {
      return defaultCrime;
    }

    return this.customCrimeCatalog.get(crimeId) ?? null;
  }

  async createCrime(input: CreateCrimeInput): Promise<CrimeDefinition> {
    if (this.findCrimeById(input.id)) {
      throw new BadRequestException(`Crime "${input.id}" already exists.`);
    }

    assertPositiveInteger(input.unlockLevel, `Crime "${input.id}" unlockLevel`);
    assertNonNegativeInteger(
      input.cashRewardMin,
      `Crime "${input.id}" cashRewardMin`
    );
    assertNonNegativeInteger(
      input.cashRewardMax,
      `Crime "${input.id}" cashRewardMax`
    );
    assertNonNegativeInteger(
      input.respectReward,
      `Crime "${input.id}" respectReward`
    );

    if (input.cashRewardMin > input.cashRewardMax) {
      throw new BadRequestException(
        `Crime "${input.id}" cashRewardMin must be less than or equal to cashRewardMax.`
      );
    }

    const crime = buildCrimeDefinition({
      id: input.id,
      name: input.name,
      unlockLevel: input.unlockLevel,
      difficulty: input.difficulty,
      minReward: input.cashRewardMin,
      maxReward: input.cashRewardMax,
      respectReward: input.respectReward
    });

    await this.crimeBalanceRepository.upsertCrimeBalance(
      this.toCrimeBalanceRecord(crime, true)
    );

    this.customCrimeCatalog.set(crime.id, cloneCrimeDefinition(crime));

    return cloneCrimeDefinition(crime);
  }

  async updateCrimeBalances(
    updates: readonly UpdateCrimeBalanceInput[]
  ): Promise<CrimeDefinition[]> {
    for (const update of updates) {
      const crime = this.findCrimeById(update.id);

      if (!crime) {
        throw new NotFoundException(`Crime "${update.id}" was not found.`);
      }

      const nextCrime: CrimeDefinition = {
        ...crime,
        energyCost: update.energyCost ?? crime.energyCost,
        successRate: update.successRate ?? crime.successRate,
        minReward: update.minReward ?? update.cashRewardMin ?? crime.minReward,
        maxReward: update.maxReward ?? update.cashRewardMax ?? crime.maxReward,
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
        nextCrime.minReward,
        `Crime "${crime.id}" minReward`
      );
      assertNonNegativeInteger(
        nextCrime.maxReward,
        `Crime "${crime.id}" maxReward`
      );
      assertNonNegativeInteger(
        nextCrime.respectReward,
        `Crime "${crime.id}" respectReward`
      );

      if (nextCrime.minReward > nextCrime.maxReward) {
        throw new BadRequestException(
          `Crime "${crime.id}" minReward must be less than or equal to maxReward.`
        );
      }

      if (this.customCrimeCatalog.has(crime.id)) {
        this.customCrimeCatalog.set(crime.id, cloneCrimeDefinition(nextCrime));
      } else {
        applyCrimeBalanceOverride(crime.id, {
          energyCost: nextCrime.energyCost,
          successRate: nextCrime.successRate,
          minReward: nextCrime.minReward,
          maxReward: nextCrime.maxReward,
          respectReward: nextCrime.respectReward
        });
      }

      await this.crimeBalanceRepository.upsertCrimeBalance(
        this.toCrimeBalanceRecord(nextCrime, this.customCrimeCatalog.has(crime.id))
      );
    }

    return this.listCrimeBalances();
  }

  private toCrimeBalanceRecord(
    crime: CrimeDefinition,
    isCustomCrime: boolean
  ) {
    return {
      crimeId: crime.id,
      name: isCustomCrime ? crime.name : null,
      unlockLevel: isCustomCrime ? crime.unlockLevel : null,
      difficulty: isCustomCrime ? crime.difficulty : null,
      energyCost: crime.energyCost,
      successRate: crime.successRate,
      cashRewardMin: crime.minReward,
      cashRewardMax: crime.maxReward,
      respectReward: crime.respectReward
    };
  }
}
