export declare const custodyStatusTypes: readonly ["jail", "hospital"];
export type CustodyStatusType = (typeof custodyStatusTypes)[number];
export declare const custodyBuyoutRoundingRules: readonly ["ceil"];
export type CustodyBuyoutRoundingRule = (typeof custodyBuyoutRoundingRules)[number];
export interface CustodyBuyoutLevelConfig {
    level: number;
    rank: string;
    basePricePerMinute: number;
}
export interface CustodyBuyoutStatusConfig {
    statusType: CustodyStatusType;
    label: string;
    escalationEnabled: boolean;
    escalationPercentage: number;
    minimumPrice: number | null;
    roundingRule: CustodyBuyoutRoundingRule;
    levels: CustodyBuyoutLevelConfig[];
}
export interface CustodyBuyoutQuote {
    statusType: CustodyStatusType;
    active: boolean;
    until: Date | null;
    remainingSeconds: number;
    reason: string | null;
    entryCountSinceLevelReset: number;
    repeatCountSinceLevelReset: number;
    basePricePerMinute: number | null;
    currentPricePerMinute: number | null;
    escalationEnabled: boolean;
    escalationPercentage: number;
    minimumPrice: number | null;
    roundingRule: CustodyBuyoutRoundingRule;
    buyoutPrice: number | null;
}
