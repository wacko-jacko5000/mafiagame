import { combatRuleSet } from "./combat.constants";
import type {
  CombatCalculationInput,
  CombatLoadoutSnapshot,
  CombatResolution
} from "./combat.types";

export function toCombatLoadoutSnapshot(loadout: {
  weapon: { itemId: string; attackBonus: number } | null;
  armor: { itemId: string; defenseBonus: number } | null;
}): CombatLoadoutSnapshot {
  return {
    weaponItemId: loadout.weapon?.itemId ?? null,
    weaponAttackBonus: loadout.weapon?.attackBonus ?? 0,
    armorItemId: loadout.armor?.itemId ?? null,
    armorDefenseBonus: loadout.armor?.defenseBonus ?? 0
  };
}

export function resolveCombatAttack(
  input: CombatCalculationInput
): CombatResolution {
  const baseAttack = combatRuleSet.baseAttack;
  const weaponBonus = input.attackerLoadout.weaponAttackBonus;
  const armorReduction = input.targetLoadout.armorDefenseBonus;
  const damageDealt = Math.max(
    combatRuleSet.minimumDamage,
    baseAttack + weaponBonus - armorReduction
  );

  return {
    baseAttack,
    weaponBonus,
    armorReduction,
    damageDealt
  };
}
