export const playerFoundationDefaults = {
  cash: 2500,
  respect: 0,
  energy: 100,
  health: 100
} as const;

export const playerEnergyRecoveryRules = {
  maxEnergy: playerFoundationDefaults.energy,
  energyPerMinute: 1,
  recoveryIntervalMs: 60_000
} as const;

export const playerHeatDecayRules = {
  maxHeat: 100,
  gainPerCrime: 4,
  decayPerInterval: 1,
  decayIntervalMs: 60_000
} as const;

export const playerDisplayNameRules = {
  minLength: 3,
  maxLength: 24,
  pattern: /^[a-zA-Z0-9_ -]+$/
} as const;
