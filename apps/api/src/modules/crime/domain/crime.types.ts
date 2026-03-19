export type CrimeFailureConsequence =
  | {
      type: "none";
    }
  | {
      type: "jail";
      durationSeconds: number;
    }
  | {
      type: "hospital";
      durationSeconds: number;
    };

export interface CrimeDefinition {
  id: string;
  name: string;
  energyCost: number;
  successRate: number;
  cashRewardMin: number;
  cashRewardMax: number;
  respectReward: number;
  failureConsequence: CrimeFailureConsequence;
}

export interface CrimeOutcome {
  crimeId: string;
  success: boolean;
  energySpent: number;
  cashAwarded: number;
  respectAwarded: number;
  consequence: {
    type: "none" | "jail" | "hospital";
    activeUntil: Date | null;
  };
}
