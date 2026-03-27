import { OnModuleInit } from "@nestjs/common";
import { type CustodyBalanceRepository } from "./custody-balance.repository";
import { type CustodyBuyoutQuote, type CustodyBuyoutStatusConfig, type CustodyStatusType } from "../domain/custody.types";
export interface UpdateCustodyBalanceInput {
    statusType: CustodyStatusType;
    escalationEnabled?: boolean;
    escalationPercentage?: number;
    minimumPrice?: number | null;
    roundingRule?: "ceil";
    levels?: Array<{
        level: number;
        basePricePerMinute: number;
    }>;
}
export declare class CustodyBalanceService implements OnModuleInit {
    private readonly custodyBalanceRepository;
    private readonly configOverrides;
    private readonly levelOverrides;
    constructor(custodyBalanceRepository: CustodyBalanceRepository);
    onModuleInit(): Promise<void>;
    listStatusConfigs(): CustodyBuyoutStatusConfig[];
    getStatusConfig(statusType: CustodyStatusType): CustodyBuyoutStatusConfig;
    updateBalances(updates: readonly UpdateCustodyBalanceInput[]): Promise<CustodyBuyoutStatusConfig[]>;
    buildQuote(input: {
        statusType: CustodyStatusType;
        active: boolean;
        until: Date | null;
        reason: string | null;
        remainingSeconds: number;
        playerLevel: number;
        entryCountSinceLevelReset: number;
    }): CustodyBuyoutQuote;
    private getLevelKey;
    private assertEscalationPercentage;
    private assertMinimumPrice;
    private assertRoundingRule;
    private assertBasePrice;
}
