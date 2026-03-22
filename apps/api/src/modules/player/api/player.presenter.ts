import type { PlayerSnapshot } from "../domain/player.types";
import { derivePlayerProgression } from "../domain/player.policy";
import type {
  PlayerResponseBody,
  PlayerResourcesResponseBody
} from "./player.contracts";

export function toPlayerResponseBody(
  player: PlayerSnapshot
): PlayerResponseBody {
  const progression = derivePlayerProgression(player.respect);

  return {
    id: player.id,
    displayName: player.displayName,
    cash: player.cash,
    level: progression.level,
    rank: progression.rank,
    currentRespect: progression.currentRespect,
    currentLevelMinRespect: progression.currentLevelMinRespect,
    nextLevel: progression.nextLevel,
    nextRank: progression.nextRank,
    nextLevelRespectRequired: progression.nextLevelRespectRequired,
    respectToNextLevel: progression.respectToNextLevel,
    progressPercent: progression.progressPercent,
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
