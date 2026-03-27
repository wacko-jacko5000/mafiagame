"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCombatLoadoutSnapshot = toCombatLoadoutSnapshot;
exports.resolveCombatAttack = resolveCombatAttack;
const combat_constants_1 = require("./combat.constants");
function toCombatLoadoutSnapshot(loadout) {
    return {
        weaponItemId: loadout.weapon?.itemId ?? null,
        weaponAttackBonus: loadout.weapon?.attackBonus ?? 0,
        armorItemId: loadout.armor?.itemId ?? null,
        armorDefenseBonus: loadout.armor?.defenseBonus ?? 0
    };
}
function resolveCombatAttack(input) {
    const baseAttack = combat_constants_1.combatRuleSet.baseAttack;
    const weaponBonus = input.attackerLoadout.weaponAttackBonus;
    const armorReduction = input.targetLoadout.armorDefenseBonus;
    const damageDealt = Math.max(combat_constants_1.combatRuleSet.minimumDamage, baseAttack + weaponBonus - armorReduction);
    return {
        baseAttack,
        weaponBonus,
        armorReduction,
        damageDealt
    };
}
