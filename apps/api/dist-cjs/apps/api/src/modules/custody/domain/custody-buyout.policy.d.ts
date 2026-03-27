import type { CustodyBuyoutQuote, CustodyBuyoutRoundingRule, CustodyBuyoutStatusConfig, CustodyStatusType } from "./custody.types";
export declare function getDefaultBasePricePerMinute(statusType: CustodyStatusType, level: number): number;
export declare function getRepeatCountSinceLevelReset(entryCountSinceLevelReset: number): number;
export declare function calculateCustodyPricePerMinute(input: {
    basePricePerMinute: number;
    entryCountSinceLevelReset: number;
    escalationEnabled: boolean;
    escalationPercentage: number;
}): number;
export declare function calculateCustodyBuyoutPrice(input: {
    remainingSeconds: number;
    currentPricePerMinute: number;
    minimumPrice: number | null;
    roundingRule: CustodyBuyoutRoundingRule;
}): number;
export declare function buildInactiveCustodyBuyoutQuote(statusType: CustodyStatusType, config: Pick<CustodyBuyoutStatusConfig, "escalationEnabled" | "escalationPercentage" | "minimumPrice" | "roundingRule">): CustodyBuyoutQuote;
