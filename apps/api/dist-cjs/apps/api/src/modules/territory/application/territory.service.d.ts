import { GangsService } from "../../gangs/application/gangs.service";
import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import type { ClaimDistrictByPlayerCommand, ClaimDistrictPayoutByPlayerCommand, DistrictPayoutClaimResult, DistrictSummary, DistrictWarSummary, ResolveDistrictWarCommand, ResolveDistrictWarResult, StartDistrictWarCommand } from "../domain/territory.types";
import { type TerritoryRepository } from "./territory.repository";
export declare class TerritoryService {
    private readonly playerService;
    private readonly gangsService;
    private readonly domainEventsService;
    private readonly territoryRepository;
    constructor(playerService: PlayerService, gangsService: GangsService, domainEventsService: DomainEventsService, territoryRepository: TerritoryRepository);
    listDistricts(): Promise<DistrictSummary[]>;
    getDistrictById(districtId: string): Promise<DistrictSummary>;
    claimDistrict(command: ClaimDistrictByPlayerCommand): Promise<DistrictSummary>;
    claimDistrictPayout(command: ClaimDistrictPayoutByPlayerCommand): Promise<DistrictPayoutClaimResult>;
    startWar(command: StartDistrictWarCommand): Promise<DistrictWarSummary>;
    getDistrictWarForDistrict(districtId: string): Promise<DistrictWarSummary | null>;
    getDistrictWarById(warId: string): Promise<DistrictWarSummary>;
    resolveWar(command: ResolveDistrictWarCommand): Promise<ResolveDistrictWarResult>;
    private toDistrictController;
    private toDistrictPayoutSummary;
    private toDistrictWarSummary;
}
