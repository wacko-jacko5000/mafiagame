import type { ClaimDistrictPayoutStatus, ClaimDistrictCommand, DistrictControlSnapshot, DistrictWarSnapshot, DistrictWithControlSnapshot } from "../domain/territory.types";
export declare const TERRITORY_REPOSITORY: unique symbol;
export interface TerritoryRepository {
    listDistricts(): Promise<DistrictWithControlSnapshot[]>;
    findDistrictById(districtId: string): Promise<DistrictWithControlSnapshot | null>;
    updateDistrictBalance(command: {
        districtId: string;
        payoutAmount: number;
        payoutCooldownMinutes: number;
    }): Promise<DistrictWithControlSnapshot | null>;
    claimDistrict(command: ClaimDistrictCommand): Promise<DistrictControlSnapshot | null>;
    claimDistrictPayout(command: {
        districtId: string;
        gangId: string;
        claimedAt: Date;
        latestEligibleClaimedAt: Date;
    }): Promise<ClaimDistrictPayoutStatus>;
    findActiveWarByDistrictId(districtId: string): Promise<DistrictWarSnapshot | null>;
    findWarById(warId: string): Promise<DistrictWarSnapshot | null>;
    startWar(command: {
        districtId: string;
        attackerGangId: string;
        defenderGangId: string;
        startedByPlayerId: string;
    }): Promise<DistrictWarSnapshot | null>;
    resolveWar(command: {
        warId: string;
        winningGangId: string;
    }): Promise<DistrictWarSnapshot | null>;
}
