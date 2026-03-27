import type { CombatAttackCommand, CombatAttackPersistenceResult } from "../domain/combat.types";
export declare const COMBAT_REPOSITORY: unique symbol;
export interface CombatRepository {
    applyAttack(command: CombatAttackCommand): Promise<CombatAttackPersistenceResult | null>;
}
