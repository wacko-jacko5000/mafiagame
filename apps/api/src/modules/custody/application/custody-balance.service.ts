import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit
} from "@nestjs/common";

import { playerRankCatalog } from "../../player/domain/player-rank.catalog";
import {
  CUSTODY_BALANCE_REPOSITORY,
  type CustodyBalanceRepository
} from "./custody-balance.repository";
import {
  buildDefaultCustodyBuyoutConfig
} from "../domain/custody-buyout.catalog";
import {
  buildInactiveCustodyBuyoutQuote,
  calculateCustodyBuyoutPrice,
  calculateCustodyPricePerMinute,
  getDefaultBasePricePerMinute,
  getRepeatCountSinceLevelReset
} from "../domain/custody-buyout.policy";
import {
  custodyBuyoutRoundingRules,
  custodyStatusTypes,
  type CustodyBuyoutQuote,
  type CustodyBuyoutStatusConfig,
  type CustodyStatusType
} from "../domain/custody.types";

export interface UpdateCustodyBalanceInput {
  statusType: CustodyStatusType;
  escalationEnabled?: boolean;
  escalationPercentage?: number;
  minimumPrice?: number | null;
  roundingRule?: "ceil";
  levels?: Array<{
    level: number;
    basePricePerMinute: number;
  }>;
}

@Injectable()
export class CustodyBalanceService implements OnModuleInit {
  private readonly configOverrides = new Map<
    CustodyStatusType,
    {
      escalationEnabled: boolean;
      escalationPercentage: number;
      minimumPrice: number | null;
      roundingRule: "ceil";
    }
  >();

  private readonly levelOverrides = new Map<string, number>();

  constructor(
    @Inject(CUSTODY_BALANCE_REPOSITORY)
    private readonly custodyBalanceRepository: CustodyBalanceRepository
  ) {}

  async onModuleInit(): Promise<void> {
    const [configs, levelBalances] = await Promise.all([
      this.custodyBalanceRepository.listConfigs(),
      this.custodyBalanceRepository.listLevelBalances()
    ]);

    for (const config of configs) {
      this.configOverrides.set(config.statusType, {
        escalationEnabled: config.escalationEnabled,
        escalationPercentage: config.escalationPercentage,
        minimumPrice: config.minimumPrice,
        roundingRule: config.roundingRule
      });
    }

    for (const balance of levelBalances) {
      this.levelOverrides.set(this.getLevelKey(balance.statusType, balance.level), balance.basePricePerMinute);
    }
  }

  listStatusConfigs(): CustodyBuyoutStatusConfig[] {
    return custodyStatusTypes.map((statusType) => this.getStatusConfig(statusType));
  }

  getStatusConfig(statusType: CustodyStatusType): CustodyBuyoutStatusConfig {
    const defaults = buildDefaultCustodyBuyoutConfig(statusType);
    const configOverride = this.configOverrides.get(statusType);

    return {
      ...defaults,
      escalationEnabled: configOverride?.escalationEnabled ?? defaults.escalationEnabled,
      escalationPercentage:
        configOverride?.escalationPercentage ?? defaults.escalationPercentage,
      minimumPrice: configOverride?.minimumPrice ?? defaults.minimumPrice,
      roundingRule: configOverride?.roundingRule ?? defaults.roundingRule,
      levels: defaults.levels.map((levelConfig) => ({
        ...levelConfig,
        basePricePerMinute:
          this.levelOverrides.get(this.getLevelKey(statusType, levelConfig.level)) ??
          levelConfig.basePricePerMinute
      }))
    };
  }

  async updateBalances(
    updates: readonly UpdateCustodyBalanceInput[]
  ): Promise<CustodyBuyoutStatusConfig[]> {
    for (const update of updates) {
      const current = this.getStatusConfig(update.statusType);
      const nextEscalationEnabled = update.escalationEnabled ?? current.escalationEnabled;
      const nextEscalationPercentage =
        update.escalationPercentage ?? current.escalationPercentage;
      const nextMinimumPrice =
        update.minimumPrice === undefined ? current.minimumPrice : update.minimumPrice;
      const nextRoundingRule = update.roundingRule ?? current.roundingRule;

      this.assertEscalationPercentage(nextEscalationPercentage, update.statusType);
      this.assertMinimumPrice(nextMinimumPrice, update.statusType);
      this.assertRoundingRule(nextRoundingRule, update.statusType);

      await this.custodyBalanceRepository.upsertConfig({
        statusType: update.statusType,
        escalationEnabled: nextEscalationEnabled,
        escalationPercentage: nextEscalationPercentage,
        minimumPrice: nextMinimumPrice,
        roundingRule: nextRoundingRule
      });

      this.configOverrides.set(update.statusType, {
        escalationEnabled: nextEscalationEnabled,
        escalationPercentage: nextEscalationPercentage,
        minimumPrice: nextMinimumPrice,
        roundingRule: nextRoundingRule
      });

      for (const levelUpdate of update.levels ?? []) {
        const rank = playerRankCatalog.find((entry) => entry.level === levelUpdate.level);

        if (!rank) {
          throw new BadRequestException(
            `Unknown level "${levelUpdate.level}" for ${update.statusType} buyout pricing.`
          );
        }

        this.assertBasePrice(levelUpdate.basePricePerMinute, update.statusType, levelUpdate.level);

        await this.custodyBalanceRepository.upsertLevelBalance({
          statusType: update.statusType,
          level: levelUpdate.level,
          basePricePerMinute: levelUpdate.basePricePerMinute
        });

        this.levelOverrides.set(
          this.getLevelKey(update.statusType, levelUpdate.level),
          levelUpdate.basePricePerMinute
        );
      }
    }

    return this.listStatusConfigs();
  }

  buildQuote(input: {
    statusType: CustodyStatusType;
    active: boolean;
    until: Date | null;
    reason: string | null;
    remainingSeconds: number;
    playerLevel: number;
    entryCountSinceLevelReset: number;
  }): CustodyBuyoutQuote {
    const config = this.getStatusConfig(input.statusType);

    if (!input.active || !input.until || input.remainingSeconds <= 0) {
      return buildInactiveCustodyBuyoutQuote(input.statusType, config);
    }

    const levelConfig =
      config.levels.find((entry) => entry.level === input.playerLevel) ??
      config.levels[config.levels.length - 1];
    const basePricePerMinute =
      levelConfig?.basePricePerMinute ??
      getDefaultBasePricePerMinute(input.statusType, input.playerLevel);
    const currentPricePerMinute = calculateCustodyPricePerMinute({
      basePricePerMinute,
      entryCountSinceLevelReset: input.entryCountSinceLevelReset,
      escalationEnabled: config.escalationEnabled,
      escalationPercentage: config.escalationPercentage
    });
    const buyoutPrice = calculateCustodyBuyoutPrice({
      remainingSeconds: input.remainingSeconds,
      currentPricePerMinute,
      minimumPrice: config.minimumPrice,
      roundingRule: config.roundingRule
    });

    return {
      statusType: input.statusType,
      active: true,
      until: input.until,
      remainingSeconds: input.remainingSeconds,
      reason: input.reason,
      entryCountSinceLevelReset: input.entryCountSinceLevelReset,
      repeatCountSinceLevelReset: getRepeatCountSinceLevelReset(
        input.entryCountSinceLevelReset
      ),
      basePricePerMinute,
      currentPricePerMinute,
      escalationEnabled: config.escalationEnabled,
      escalationPercentage: config.escalationPercentage,
      minimumPrice: config.minimumPrice,
      roundingRule: config.roundingRule,
      buyoutPrice
    };
  }

  private getLevelKey(statusType: CustodyStatusType, level: number): string {
    return `${statusType}:${level}`;
  }

  private assertEscalationPercentage(
    value: number,
    statusType: CustodyStatusType
  ): void {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
      throw new BadRequestException(
        `${statusType} escalationPercentage must be a number between 0 and 1.`
      );
    }
  }

  private assertMinimumPrice(
    value: number | null,
    statusType: CustodyStatusType
  ): void {
    if (value === null) {
      return;
    }

    if (!Number.isInteger(value) || value < 0) {
      throw new BadRequestException(
        `${statusType} minimumPrice must be a non-negative whole number or null.`
      );
    }
  }

  private assertRoundingRule(value: string, statusType: CustodyStatusType): void {
    if (!(custodyBuyoutRoundingRules as readonly string[]).includes(value)) {
      throw new BadRequestException(
        `${statusType} roundingRule must be one of: ${custodyBuyoutRoundingRules.join(", ")}.`
      );
    }
  }

  private assertBasePrice(
    value: number,
    statusType: CustodyStatusType,
    level: number
  ): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new BadRequestException(
        `${statusType} basePricePerMinute for level ${level} must be a positive whole number.`
      );
    }
  }
}
