import type {
  CreatePlayerActivity,
  PlayerActivitySnapshot
} from "../domain/player-activity.types";

export const PLAYER_ACTIVITY_REPOSITORY = Symbol("PLAYER_ACTIVITY_REPOSITORY");

export interface PlayerActivityRepository {
  createActivity(activity: CreatePlayerActivity): Promise<PlayerActivitySnapshot>;
  listByPlayerId(playerId: string, limit: number): Promise<PlayerActivitySnapshot[]>;
  markAsRead(
    playerId: string,
    activityId: string,
    readAt: Date
  ): Promise<PlayerActivitySnapshot | null>;
}
