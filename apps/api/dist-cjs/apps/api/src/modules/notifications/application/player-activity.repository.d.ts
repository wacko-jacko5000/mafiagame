import type { CreatePlayerActivity, PlayerActivitySnapshot } from "../domain/player-activity.types";
export declare const PLAYER_ACTIVITY_REPOSITORY: unique symbol;
export interface PlayerActivityRepository {
    createActivity(activity: CreatePlayerActivity): Promise<PlayerActivitySnapshot>;
    listByPlayerId(playerId: string, limit: number): Promise<PlayerActivitySnapshot[]>;
    markAsRead(playerId: string, activityId: string, readAt: Date): Promise<PlayerActivitySnapshot | null>;
}
