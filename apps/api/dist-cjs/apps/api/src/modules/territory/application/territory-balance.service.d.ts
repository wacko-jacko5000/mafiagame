import type { DistrictWithControlSnapshot } from "../domain/territory.types";
import { type TerritoryRepository } from "./territory.repository";
export interface UpdateDistrictBalanceInput {
    id: string;
    payoutAmount?: number;
    payoutCooldownMinutes?: number;
}
export declare class TerritoryBalanceService {
    private readonly territoryRepository;
    constructor(territoryRepository: TerritoryRepository);
    listDistrictBalances(): Promise<DistrictWithControlSnapshot[]>;
    updateDistrictBalances(updates: readonly UpdateDistrictBalanceInput[]): Promise<DistrictWithControlSnapshot[]>;
}
