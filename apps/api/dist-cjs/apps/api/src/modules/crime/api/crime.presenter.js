"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCrimeListItemResponseBody = toCrimeListItemResponseBody;
exports.toCrimeExecutionResponseBody = toCrimeExecutionResponseBody;
function toCrimeListItemResponseBody(crime) {
    return {
        id: crime.id,
        name: crime.name,
        unlockLevel: crime.unlockLevel,
        requiredLevel: crime.unlockLevel,
        difficulty: crime.difficulty,
        energyCost: crime.energyCost,
        successRate: crime.successRate,
        minReward: crime.minReward,
        maxReward: crime.maxReward,
        cashRewardMin: crime.minReward,
        cashRewardMax: crime.maxReward,
        respectReward: crime.respectReward,
        failureConsequence: crime.failureConsequence.type === "none"
            ? { type: "none" }
            : {
                type: crime.failureConsequence.type,
                durationSeconds: crime.failureConsequence.durationSeconds
            }
    };
}
function toCrimeExecutionResponseBody(outcome) {
    return {
        ...outcome,
        consequence: {
            type: outcome.consequence.type,
            activeUntil: outcome.consequence.activeUntil?.toISOString() ?? null
        }
    };
}
