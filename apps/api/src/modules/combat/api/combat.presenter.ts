import type { CombatResult } from "../domain/combat.types";
import type { CombatAttackResponseBody } from "./combat.contracts";

export function toCombatAttackResponseBody(
  result: CombatResult
): CombatAttackResponseBody {
  return {
    attackerId: result.attackerId,
    targetId: result.targetId,
    attackerWeaponItemId: result.attackerWeaponItemId,
    targetArmorItemId: result.targetArmorItemId,
    baseAttack: result.baseAttack,
    weaponBonus: result.weaponBonus,
    armorReduction: result.armorReduction,
    damageDealt: result.damageDealt,
    targetHealthBefore: result.targetHealthBefore,
    targetHealthAfter: result.targetHealthAfter,
    targetHospitalized: result.targetHospitalized,
    hospitalizedUntil: result.hospitalizedUntil?.toISOString() ?? null
  };
}
