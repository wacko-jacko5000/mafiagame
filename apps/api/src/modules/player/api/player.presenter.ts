import type { PlayerAssetBonuses } from "../../inventory/domain/inventory.types";
import type { PlayerSnapshot } from "../domain/player.types";
import { derivePlayerProgression } from "../domain/player.policy";
import type {
  PlayerResponseBody,
  PlayerResourcesResponseBody
} from "./player.contracts";

export function toPlayerResponseBody(
  player: PlayerSnapshot,
  assetBonuses: PlayerAssetBonuses = {
    respectBonus: 0,
    parkingSlots: 0,
    ownedVehicleCount: 0,
    availableVehicleSlots: 0
  }
): PlayerResponseBody {
  const progression = derivePlayerProgression(player.respect + assetBonuses.respectBonus);

  return {
    id: player.id,
    displayName: player.displayName,
    cash: player.cash,
    baseRespect: player.respect,
    assetRespectBonus: assetBonuses.respectBonus,
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
    heat: player.heat,
    heatUpdatedAt: (player.heatUpdatedAt ?? player.updatedAt).toISOString(),
    health: player.health,
    parkingSlots: assetBonuses.parkingSlots,
    ownedVehicleCount: assetBonuses.ownedVehicleCount,
    availableVehicleSlots: assetBonuses.availableVehicleSlots,
    jailedUntil: player.jailedUntil?.toISOString() ?? null,
    hospitalizedUntil: player.hospitalizedUntil?.toISOString() ?? null,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString()
  };
}

export function toPlayerResourcesResponseBody(input: {
  cash: number;
  baseRespect: number;
  assetRespectBonus: number;
  energy: number;
  health: number;
}): PlayerResourcesResponseBody {
  return {
    cash: input.cash,
    respect: input.baseRespect + input.assetRespectBonus,
    baseRespect: input.baseRespect,
    assetRespectBonus: input.assetRespectBonus,
    energy: input.energy,
    health: input.health
  };
}
