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
export declare function getStartingBalance(): Readonly<StartingBalanceCatalog>;
