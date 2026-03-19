import type { PlayerActivitySnapshot } from "../domain/player-activity.types";
import type { PlayerActivityResponseBody } from "./player-activity.contracts";

export function toPlayerActivityResponseBody(
  activity: PlayerActivitySnapshot
): PlayerActivityResponseBody {
  return {
    id: activity.id,
    playerId: activity.playerId,
    type: activity.type,
    title: activity.title,
    body: activity.body,
    createdAt: activity.createdAt.toISOString(),
    readAt: activity.readAt?.toISOString() ?? null
  };
}
