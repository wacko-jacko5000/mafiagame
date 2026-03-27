import type { PlayerCreationValues, PlayerProgressionSnapshot, PlayerSnapshot } from "./player.types";
export declare function normalizeDisplayName(displayName: string): string;
export declare function validateDisplayName(displayName: unknown): string;
export declare function buildInitialPlayerValues(displayName: string): PlayerCreationValues;
export interface RegeneratedEnergyState {
    energy: number;
    energyUpdatedAt: Date;
}
export declare function derivePlayerProgression(respect: number): PlayerProgressionSnapshot;
export declare function regeneratePlayerEnergy(player: Pick<PlayerSnapshot, "energy" | "energyUpdatedAt" | "updatedAt">, now: Date): RegeneratedEnergyState;
