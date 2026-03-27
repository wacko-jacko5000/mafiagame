import type { AuthActor } from "../../auth/domain/auth.types";
import { PlayerActivityService } from "../application/player-activity.service";
import type { PlayerActivityResponseBody } from "./player-activity.contracts";
export declare class PlayerActivityController {
    private readonly playerActivityService;
    constructor(playerActivityService: PlayerActivityService);
    listPlayerActivity(playerId: string, limit?: string): Promise<PlayerActivityResponseBody[]>;
    listCurrentPlayerActivity(actor: AuthActor | undefined, limit?: string): Promise<PlayerActivityResponseBody[]>;
    markActivityRead(playerId: string, activityId: string): Promise<PlayerActivityResponseBody>;
    markCurrentPlayerActivityRead(activityId: string, actor: AuthActor | undefined): Promise<PlayerActivityResponseBody>;
}
