import type { CrimeDefinition, CrimeOutcome } from "./crime.types";

export function resolveCrimeOutcome(
  crime: CrimeDefinition,
  successRoll: number
): CrimeOutcome {
  const success = successRoll <= crime.successRate;

  if (!success) {
    return {
      crimeId: crime.id,
      success: false,
      energySpent: crime.energyCost,
      cashAwarded: 0,
      respectAwarded: 0,
      consequence: {
        type: crime.failureConsequence.type,
        activeUntil: null
      }
    };
  }

  const rewardSpread = crime.cashRewardMax - crime.cashRewardMin;
  const clampedRoll = Math.min(Math.max(successRoll, 0), 1);
  const cashAwarded = crime.cashRewardMin + Math.round(rewardSpread * clampedRoll);

  return {
    crimeId: crime.id,
    success: true,
    energySpent: crime.energyCost,
    cashAwarded,
    respectAwarded: crime.respectReward,
    consequence: {
      type: "none",
      activeUntil: null
    }
  };
}
