import type { CrimeDefinition, CrimeOutcome } from "../domain/crime.types";
import type {
  CrimeExecutionResponseBody,
  CrimeListItemResponseBody
} from "./crime.contracts";

export function toCrimeListItemResponseBody(
  crime: CrimeDefinition
): CrimeListItemResponseBody {
  return {
    id: crime.id,
    name: crime.name,
    energyCost: crime.energyCost,
    successRate: crime.successRate,
    cashRewardMin: crime.cashRewardMin,
    cashRewardMax: crime.cashRewardMax,
    respectReward: crime.respectReward,
    failureConsequence:
      crime.failureConsequence.type === "none"
        ? { type: "none" }
        : {
            type: crime.failureConsequence.type,
            durationSeconds: crime.failureConsequence.durationSeconds
          }
  };
}

export function toCrimeExecutionResponseBody(
  outcome: CrimeOutcome
): CrimeExecutionResponseBody {
  return {
    ...outcome,
    consequence: {
      type: outcome.consequence.type,
      activeUntil: outcome.consequence.activeUntil?.toISOString() ?? null
    }
  };
}
