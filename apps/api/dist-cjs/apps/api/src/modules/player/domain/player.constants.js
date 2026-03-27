"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerDisplayNameRules = exports.playerEnergyRecoveryRules = exports.playerFoundationDefaults = void 0;
exports.playerFoundationDefaults = {
    cash: 2500,
    respect: 0,
    energy: 100,
    health: 100
};
exports.playerEnergyRecoveryRules = {
    maxEnergy: exports.playerFoundationDefaults.energy,
    energyPerMinute: 1,
    recoveryIntervalMs: 60_000
};
exports.playerDisplayNameRules = {
    minLength: 3,
    maxLength: 24,
    pattern: /^[a-zA-Z0-9_ -]+$/
};
