export interface CombatAttackResponseBody {
  attackerId: string;
  targetId: string;
  attackerWeaponItemId: string | null;
  targetArmorItemId: string | null;
  baseAttack: number;
  weaponBonus: number;
  armorReduction: number;
  damageDealt: number;
  targetHealthBefore: number;
  targetHealthAfter: number;
  targetHospitalized: boolean;
  hospitalizedUntil: string | null;
}
