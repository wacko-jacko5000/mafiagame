import type { CrimeDefinition } from "./crime.types";
export declare const starterCrimeCatalog: readonly CrimeDefinition[];
export declare function getCrimeById(crimeId: string): CrimeDefinition | undefined;
export declare function applyCrimeBalanceOverride(crimeId: string, values: Pick<CrimeDefinition, "energyCost" | "successRate" | "minReward" | "maxReward" | "respectReward">): CrimeDefinition | undefined;
export declare function resetStarterCrimeCatalog(): void;
