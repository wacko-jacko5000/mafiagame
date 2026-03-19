import type {
  CombatAttackCommand,
  CombatAttackPersistenceResult
} from "../domain/combat.types";

export const COMBAT_REPOSITORY = Symbol("COMBAT_REPOSITORY");

export interface CombatRepository {
  applyAttack(
    command: CombatAttackCommand
  ): Promise<CombatAttackPersistenceResult | null>;
}
