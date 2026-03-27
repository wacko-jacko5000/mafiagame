import { TerritoryService } from "../application/territory.service";
import type { DistrictPayoutClaimResponseBody, DistrictResponseBody, DistrictWarResponseBody, ResolveDistrictWarResponseBody } from "./territory.contracts";
export declare class TerritoryController {
    private readonly territoryService;
    constructor(territoryService: TerritoryService);
    listDistricts(): Promise<DistrictResponseBody[]>;
    getDistrictById(districtId: string): Promise<DistrictResponseBody>;
    claimDistrict(districtId: string, playerId: string, gangId: string): Promise<DistrictResponseBody>;
    claimDistrictPayout(districtId: string, playerId: string, gangId: string): Promise<DistrictPayoutClaimResponseBody>;
    startWar(districtId: string, playerId: string, attackerGangId: string): Promise<DistrictWarResponseBody>;
    getDistrictWar(districtId: string): Promise<DistrictWarResponseBody | null>;
}
export declare class DistrictWarsController {
    private readonly territoryService;
    constructor(territoryService: TerritoryService);
    getWarById(warId: string): Promise<DistrictWarResponseBody>;
    resolveWar(warId: string, winningGangId: string): Promise<ResolveDistrictWarResponseBody>;
}
