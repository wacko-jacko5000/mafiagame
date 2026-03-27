import { PlayerService } from "../../player/application/player.service";
import type { CreatePlayerActivity, PlayerActivitySnapshot } from "../domain/player-activity.types";
import { type PlayerActivityRepository } from "./player-activity.repository";
export declare class PlayerActivityService {
    private readonly playerService;
    private readonly playerActivityRepository;
    constructor(playerService: PlayerService, playerActivityRepository: PlayerActivityRepository);
    listPlayerActivity(playerId: string, limit?: number): Promise<PlayerActivitySnapshot[]>;
    createActivity(activity: CreatePlayerActivity): Promise<PlayerActivitySnapshot>;
    markActivityRead(playerId: string, activityId: string): Promise<PlayerActivitySnapshot>;
}
