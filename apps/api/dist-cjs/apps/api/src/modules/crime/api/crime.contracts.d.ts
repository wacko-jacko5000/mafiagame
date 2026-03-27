export interface CrimeListItemResponseBody {
    id: string;
    name: string;
    unlockLevel: number;
    requiredLevel: number;
    difficulty: "easy" | "medium" | "hard" | "very_hard";
    energyCost: number;
    successRate: number;
    minReward: number;
    maxReward: number;
    cashRewardMin: number;
    cashRewardMax: number;
    respectReward: number;
    failureConsequence: {
        type: "none" | "jail" | "hospital";
        durationSeconds?: number;
    };
}
export interface CrimeExecutionResponseBody {
    crimeId: string;
    success: boolean;
    energySpent: number;
    cashAwarded: number;
    respectAwarded: number;
    consequence: {
        type: "none" | "jail" | "hospital";
        activeUntil: string | null;
    };
}
