import { OnModuleInit } from "@nestjs/common";
import type { CrimeDefinition } from "../domain/crime.types";
import { type CrimeBalanceRepository } from "./crime-balance.repository";
export interface UpdateCrimeBalanceInput {
    id: string;
    energyCost?: number;
    successRate?: number;
    minReward?: number;
    maxReward?: number;
    cashRewardMin?: number;
    cashRewardMax?: number;
    respectReward?: number;
}
export declare class CrimeBalanceService implements OnModuleInit {
    private readonly crimeBalanceRepository;
    constructor(crimeBalanceRepository: CrimeBalanceRepository);
    onModuleInit(): Promise<void>;
    listCrimeBalances(): CrimeDefinition[];
    updateCrimeBalances(updates: readonly UpdateCrimeBalanceInput[]): Promise<CrimeDefinition[]>;
}
