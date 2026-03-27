import {
  buildDefaultCustodyBuyoutConfig
} from "./custody-buyout.catalog";
import type {
  CustodyBuyoutQuote,
  CustodyBuyoutRoundingRule,
  CustodyBuyoutStatusConfig,
  CustodyStatusType
} from "./custody.types";

export function getDefaultBasePricePerMinute(
  statusType: CustodyStatusType,
  level: number
): number {
  const config = buildDefaultCustodyBuyoutConfig(statusType);
  const levelConfig =
    config.levels.find((entry) => entry.level === level) ??
    config.levels[config.levels.length - 1];

  return levelConfig.basePricePerMinute;
}

export function getRepeatCountSinceLevelReset(entryCountSinceLevelReset: number): number {
  return Math.max(0, entryCountSinceLevelReset - 1);
}

export function calculateCustodyPricePerMinute(input: {
  basePricePerMinute: number;
  entryCountSinceLevelReset: number;
  escalationEnabled: boolean;
  escalationPercentage: number;
}): number {
  const repeatCountSinceLevelReset = getRepeatCountSinceLevelReset(
    input.entryCountSinceLevelReset
  );
  const multiplier = input.escalationEnabled
    ? 1 + repeatCountSinceLevelReset * input.escalationPercentage
    : 1;

  return input.basePricePerMinute * multiplier;
}

export function calculateCustodyBuyoutPrice(input: {
  remainingSeconds: number;
  currentPricePerMinute: number;
  minimumPrice: number | null;
  roundingRule: CustodyBuyoutRoundingRule;
}): number {
  const rawTotalPrice = (input.currentPricePerMinute * input.remainingSeconds) / 60;
  const boundedPrice = Math.max(rawTotalPrice, input.minimumPrice ?? 0);

  if (input.roundingRule === "ceil") {
    return Math.ceil(boundedPrice);
  }

  return Math.ceil(boundedPrice);
}

export function buildInactiveCustodyBuyoutQuote(
  statusType: CustodyStatusType,
  config: Pick<
    CustodyBuyoutStatusConfig,
    "escalationEnabled" | "escalationPercentage" | "minimumPrice" | "roundingRule"
  >
): CustodyBuyoutQuote {
  return {
    statusType,
    active: false,
    until: null,
    remainingSeconds: 0,
    reason: null,
    entryCountSinceLevelReset: 0,
    repeatCountSinceLevelReset: 0,
    basePricePerMinute: null,
    currentPricePerMinute: null,
    escalationEnabled: config.escalationEnabled,
    escalationPercentage: config.escalationPercentage,
    minimumPrice: config.minimumPrice,
    roundingRule: config.roundingRule,
    buyoutPrice: null
  };
}
