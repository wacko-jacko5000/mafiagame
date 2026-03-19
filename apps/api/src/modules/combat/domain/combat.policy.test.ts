import { describe, expect, it } from "vitest";

import { resolveCombatAttack } from "./combat.policy";

describe("combat policy", () => {
  it("applies base attack, weapon bonus, and armor reduction", () => {
    const result = resolveCombatAttack({
      attacker: {
        id: "attacker-1",
        displayName: "Attacker",
        health: 100
      },
      target: {
        id: "target-1",
        displayName: "Target",
        health: 100
      },
      attackerLoadout: {
        weaponItemId: "cheap-pistol",
        weaponAttackBonus: 8,
        armorItemId: null,
        armorDefenseBonus: 0
      },
      targetLoadout: {
        weaponItemId: null,
        weaponAttackBonus: 0,
        armorItemId: "leather-jacket",
        armorDefenseBonus: 3
      }
    });

    expect(result).toEqual({
      baseAttack: 12,
      weaponBonus: 8,
      armorReduction: 3,
      damageDealt: 17
    });
  });

  it("never deals less than the minimum damage floor", () => {
    const result = resolveCombatAttack({
      attacker: {
        id: "attacker-1",
        displayName: "Attacker",
        health: 100
      },
      target: {
        id: "target-1",
        displayName: "Target",
        health: 100
      },
      attackerLoadout: {
        weaponItemId: null,
        weaponAttackBonus: 0,
        armorItemId: null,
        armorDefenseBonus: 0
      },
      targetLoadout: {
        weaponItemId: null,
        weaponAttackBonus: 0,
        armorItemId: "heavy-armor",
        armorDefenseBonus: 99
      }
    });

    expect(result.damageDealt).toBe(2);
  });
});
