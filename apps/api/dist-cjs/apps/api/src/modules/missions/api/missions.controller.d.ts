import type { AuthActor } from "../../auth/domain/auth.types";
import { MissionsService } from "../application/missions.service";
import type { MissionCompletionResponseBody, MissionDefinitionResponseBody, PlayerMissionResponseBody } from "./missions.contracts";
export declare class MissionsController {
    private readonly missionsService;
    constructor(missionsService: MissionsService);
    getMissions(): MissionDefinitionResponseBody[];
    getPlayerMissions(playerId: string): Promise<PlayerMissionResponseBody[]>;
    getCurrentPlayerMissions(actor: AuthActor | undefined): Promise<PlayerMissionResponseBody[]>;
    acceptMission(playerId: string, missionId: string): Promise<PlayerMissionResponseBody>;
    acceptCurrentPlayerMission(missionId: string, actor: AuthActor | undefined): Promise<PlayerMissionResponseBody>;
    completeMission(playerId: string, missionId: string): Promise<MissionCompletionResponseBody>;
    completeCurrentPlayerMission(missionId: string, actor: AuthActor | undefined): Promise<MissionCompletionResponseBody>;
}
