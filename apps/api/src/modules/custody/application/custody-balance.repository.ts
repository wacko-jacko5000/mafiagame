import type {
  CustodyBuyoutRoundingRule,
  CustodyStatusType
} from "../domain/custody.types";

export interface CustodyBuyoutConfigRecord {
  statusType: CustodyStatusType;
  escalationEnabled: boolean;
  escalationPercentage: number;
  minimumPrice: number | null;
  roundingRule: CustodyBuyoutRoundingRule;
}

export interface CustodyBuyoutLevelRecord {
  statusType: CustodyStatusType;
  level: number;
  basePricePerMinute: number;
}

export const CUSTODY_BALANCE_REPOSITORY = Symbol("CUSTODY_BALANCE_REPOSITORY");

export interface CustodyBalanceRepository {
  listConfigs(): Promise<CustodyBuyoutConfigRecord[]>;
  upsertConfig(config: CustodyBuyoutConfigRecord): Promise<CustodyBuyoutConfigRecord>;
  listLevelBalances(): Promise<CustodyBuyoutLevelRecord[]>;
  upsertLevelBalance(balance: CustodyBuyoutLevelRecord): Promise<CustodyBuyoutLevelRecord>;
}
