import type { PlayerSnapshot } from "../domain/player.types";
import type {
  PlayerResponseBody,
  PlayerResourcesResponseBody
} from "./player.contracts";

export function toPlayerResponseBody(
  player: PlayerSnapshot
): PlayerResponseBody {
  return {
    id: player.id,
    displayName: player.displayName,
    cash: player.cash,
    respect: player.respect,
    energy: player.energy,
    health: player.health,
    jailedUntil: player.jailedUntil?.toISOString() ?? null,
    hospitalizedUntil: player.hospitalizedUntil?.toISOString() ?? null,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString()
  };
}

export function toPlayerResourcesResponseBody(
  resources: PlayerResourcesResponseBody
): PlayerResourcesResponseBody {
  return resources;
}
