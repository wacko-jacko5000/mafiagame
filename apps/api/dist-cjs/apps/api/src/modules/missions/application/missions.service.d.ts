import { GangsService } from "../../gangs/application/gangs.service";
import { InventoryService } from "../../inventory/application/inventory.service";
import type { InventoryListItem } from "../../inventory/domain/inventory.types";
import { PlayerService } from "../../player/application/player.service";
import { TerritoryService } from "../../territory/application/territory.service";
import type { MissionCompletionResult, MissionDefinition, MissionObjectiveType, PlayerMissionView } from "../domain/missions.types";
import { type MissionsRepository } from "./missions.repository";
interface MissionProgressContext {
    itemType?: InventoryListItem["type"];
}
export declare class MissionsService {
    private readonly playerService;
    private readonly inventoryService;
    private readonly gangsService;
    private readonly territoryService;
    private readonly missionsRepository;
    constructor(playerService: PlayerService, inventoryService: InventoryService, gangsService: GangsService, territoryService: TerritoryService, missionsRepository: MissionsRepository);
    listMissions(): readonly MissionDefinition[];
    listPlayerMissions(playerId: string): Promise<PlayerMissionView[]>;
    acceptMission(playerId: string, missionId: string): Promise<PlayerMissionView>;
    recordProgress(playerId: string, objectiveType: MissionObjectiveType, amount?: number, context?: MissionProgressContext): Promise<void>;
    completeMission(playerId: string, missionId: string): Promise<MissionCompletionResult>;
    private getMissionDefinitionOrThrow;
    private toMissionViewOrThrow;
    private toMissionView;
    private syncActiveMissionProgress;
    private syncMissionProgress;
    private evaluateMissionProgress;
    private matchesProgressContext;
    private getPlayer;
    private getInventory;
    private getEquipped;
    private getMembership;
    private getControlledDistrictCount;
}
export {};
