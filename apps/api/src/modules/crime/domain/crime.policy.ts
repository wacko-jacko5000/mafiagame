import type { CrimeDefinition, CrimeOutcome } from "./crime.types";

export function resolveCrimeOutcome(
  crime: CrimeDefinition,
  successRoll: number,
  heat = 0
): CrimeOutcome {
  const heatMultiplier = Math.max(0.4, 1 - heat * 0.008);
  const effectiveSuccessRate = crime.successRate * heatMultiplier;
  const success = successRoll <= effectiveSuccessRate;

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

  const rewardSpread = crime.maxReward - crime.minReward;
  const clampedRoll = Math.min(Math.max(successRoll, 0), 1);
  const cashAwarded = crime.minReward + Math.round(rewardSpread * clampedRoll);

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
