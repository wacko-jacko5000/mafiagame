import type { CrimeDefinition } from "./crime.types";

const defaultStarterCrimeCatalog: readonly CrimeDefinition[] = [
  {
    id: "pickpocket",
    name: "Pickpocket",
    energyCost: 10,
    successRate: 0.75,
    cashRewardMin: 120,
    cashRewardMax: 220,
    respectReward: 1,
    failureConsequence: {
      type: "none"
    }
  },
  {
    id: "shoplift",
    name: "Shoplift",
    energyCost: 14,
    successRate: 0.62,
    cashRewardMin: 200,
    cashRewardMax: 340,
    respectReward: 2,
    failureConsequence: {
      type: "jail",
      durationSeconds: 300
    }
  },
  {
    id: "steal-bike",
    name: "Steal Bike",
    energyCost: 20,
    successRate: 0.48,
    cashRewardMin: 350,
    cashRewardMax: 520,
    respectReward: 3,
    failureConsequence: {
      type: "hospital",
      durationSeconds: 480
    }
  }
] as const;

export const starterCrimeCatalog: readonly CrimeDefinition[] =
  defaultStarterCrimeCatalog.map((crime) => ({
    ...crime,
    failureConsequence: { ...crime.failureConsequence }
  }));

export function getCrimeById(crimeId: string): CrimeDefinition | undefined {
  return starterCrimeCatalog.find((crime) => crime.id === crimeId);
}

export function applyCrimeBalanceOverride(
  crimeId: string,
  values: Pick<
    CrimeDefinition,
    "energyCost" | "successRate" | "cashRewardMin" | "cashRewardMax" | "respectReward"
  >
): CrimeDefinition | undefined {
  const crime = getCrimeById(crimeId);

  if (!crime) {
    return undefined;
  }

  crime.energyCost = values.energyCost;
  crime.successRate = values.successRate;
  crime.cashRewardMin = values.cashRewardMin;
  crime.cashRewardMax = values.cashRewardMax;
  crime.respectReward = values.respectReward;

  return crime;
}

export function resetStarterCrimeCatalog(): void {
  starterCrimeCatalog.forEach((crime, index) => {
    const defaultCrime = defaultStarterCrimeCatalog[index]!;

    crime.id = defaultCrime.id;
    crime.name = defaultCrime.name;
    crime.energyCost = defaultCrime.energyCost;
    crime.successRate = defaultCrime.successRate;
    crime.cashRewardMin = defaultCrime.cashRewardMin;
    crime.cashRewardMax = defaultCrime.cashRewardMax;
    crime.respectReward = defaultCrime.respectReward;
    crime.failureConsequence = { ...defaultCrime.failureConsequence };
  });
}
