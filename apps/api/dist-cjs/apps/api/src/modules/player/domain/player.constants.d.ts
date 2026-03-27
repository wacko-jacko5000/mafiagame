export declare const playerFoundationDefaults: {
    readonly cash: 2500;
    readonly respect: 0;
    readonly energy: 100;
    readonly health: 100;
};
export declare const playerEnergyRecoveryRules: {
    readonly maxEnergy: 100;
    readonly energyPerMinute: 1;
    readonly recoveryIntervalMs: 60000;
};
export declare const playerDisplayNameRules: {
    readonly minLength: 3;
    readonly maxLength: 24;
    readonly pattern: RegExp;
};
