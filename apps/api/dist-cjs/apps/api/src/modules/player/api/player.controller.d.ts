import type { AuthActor } from "../../auth/domain/auth.types";
import { PlayerService } from "../application/player.service";
import type { CreatePlayerRequestBody, PlayerResourcesResponseBody, PlayerResponseBody } from "./player.contracts";
export declare class PlayerController {
    private readonly playerService;
    constructor(playerService: PlayerService);
    createPlayer(body: CreatePlayerRequestBody, actor?: AuthActor): Promise<PlayerResponseBody>;
    getPlayerById(playerId: string): Promise<PlayerResponseBody>;
    getPlayerResources(playerId: string): Promise<PlayerResourcesResponseBody>;
}
