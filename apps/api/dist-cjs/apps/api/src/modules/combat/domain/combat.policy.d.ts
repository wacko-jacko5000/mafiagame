import type { CombatCalculationInput, CombatLoadoutSnapshot, CombatResolution } from "./combat.types";
export declare function toCombatLoadoutSnapshot(loadout: {
    weapon: {
        itemId: string;
        attackBonus: number;
    } | null;
    armor: {
        itemId: string;
        defenseBonus: number;
    } | null;
}): CombatLoadoutSnapshot;
export declare function resolveCombatAttack(input: CombatCalculationInput): CombatResolution;
