import type { MissionCompletionResult, MissionDefinition, PlayerMissionView } from "../domain/missions.types";
import type { MissionCompletionResponseBody, MissionDefinitionResponseBody, PlayerMissionResponseBody } from "./missions.contracts";
export declare function toMissionDefinitionResponseBody(mission: MissionDefinition): MissionDefinitionResponseBody;
export declare function toPlayerMissionResponseBody(mission: PlayerMissionView): PlayerMissionResponseBody;
export declare function toMissionCompletionResponseBody(result: MissionCompletionResult): MissionCompletionResponseBody;
