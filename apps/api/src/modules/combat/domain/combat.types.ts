export interface CombatParticipantSnapshot {
  id: string;
  displayName: string;
  health: number;
}

export interface CombatLoadoutSnapshot {
  weaponItemId: string | null;
  weaponAttackBonus: number;
  armorItemId: string | null;
  armorDefenseBonus: number;
}

export interface CombatCalculationInput {
  attacker: CombatParticipantSnapshot;
  target: CombatParticipantSnapshot;
  attackerLoadout: CombatLoadoutSnapshot;
  targetLoadout: CombatLoadoutSnapshot;
}

export interface CombatResolution {
  baseAttack: number;
  weaponBonus: number;
  armorReduction: number;
  damageDealt: number;
}

export interface CombatAttackCommand {
  attackerId: string;
  targetId: string;
  damageDealt: number;
  hospitalThreshold: number;
  hospitalDurationSeconds: number;
  hospitalReason: string | null;
  now: Date;
}

export interface CombatAttackPersistenceResult {
  targetHealthBefore: number;
  targetHealthAfter: number;
  targetHospitalized: boolean;
  hospitalizedUntil: Date | null;
}

export interface CombatResult {
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
  hospitalizedUntil: Date | null;
  cashStolen: number;
}
