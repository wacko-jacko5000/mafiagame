export const CRIME_BALANCE_REPOSITORY = Symbol("CRIME_BALANCE_REPOSITORY");

export interface CrimeBalanceRecord {
  crimeId: string;
  energyCost: number;
  successRate: number;
  cashRewardMin: number;
  cashRewardMax: number;
  respectReward: number;
}

export interface CrimeBalanceRepository {
  listCrimeBalances(): Promise<CrimeBalanceRecord[]>;
  upsertCrimeBalance(balance: CrimeBalanceRecord): Promise<CrimeBalanceRecord>;
}
