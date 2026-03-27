import { PrismaService } from "../../../platform/database/prisma.service";
import type { TerritoryRepository } from "../application/territory.repository";
import type { ClaimDistrictCommand, DistrictControlSnapshot, DistrictWarSnapshot, DistrictWithControlSnapshot } from "../domain/territory.types";
export declare class PrismaTerritoryRepository implements TerritoryRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
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
    }): Promise<"claimed" | "district_not_found" | "district_uncontrolled" | "gang_not_controller" | "cooldown_not_elapsed">;
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
