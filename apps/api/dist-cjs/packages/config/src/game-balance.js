"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartingBalance = getStartingBalance;
const startingBalance = {
    economy: {
        startingCash: 2500,
        hospitalHealCostBase: 300,
        jailBribeCostBase: 500
    },
    stats: {
        baseHealth: 100,
        baseStamina: 100,
        staminaRecoveryPerMinute: 5
    },
    crime: {
        defaultHeatGain: 4,
        defaultCooldownSeconds: 60
    }
};
function getStartingBalance() {
    return startingBalance;
}
