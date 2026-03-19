import type { PlayerActivityType } from "../domain/player-activity.types";

export interface PlayerActivityResponseBody {
  id: string;
  playerId: string;
  type: PlayerActivityType;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}
