"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const combat_policy_1 = require("./combat.policy");
(0, vitest_1.describe)("combat policy", () => {
    (0, vitest_1.it)("applies base attack, weapon bonus, and armor reduction", () => {
        const result = (0, combat_policy_1.resolveCombatAttack)({
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
        (0, vitest_1.expect)(result).toEqual({
            baseAttack: 12,
            weaponBonus: 8,
            armorReduction: 3,
            damageDealt: 17
        });
    });
    (0, vitest_1.it)("never deals less than the minimum damage floor", () => {
        const result = (0, combat_policy_1.resolveCombatAttack)({
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
        (0, vitest_1.expect)(result.damageDealt).toBe(2);
    });
});
