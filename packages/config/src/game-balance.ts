export interface StartingBalanceCatalog {
  economy: {
    startingCash: number;
    hospitalHealCostBase: number;
    jailBribeCostBase: number;
  };
  stats: {
    baseHealth: number;
    baseStamina: number;
    staminaRecoveryPerMinute: number;
  };
  crime: {
    defaultHeatGain: number;
    defaultCooldownSeconds: number;
  };
}

const startingBalance: StartingBalanceCatalog = {
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

export function getStartingBalance(): Readonly<StartingBalanceCatalog> {
  return startingBalance;
}
