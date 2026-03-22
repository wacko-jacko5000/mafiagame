import {
  playerEnergyRecoveryRules,
  playerDisplayNameRules,
  playerFoundationDefaults
} from "./player.constants";
import { playerRankCatalog } from "./player-rank.catalog";
import {
  InvalidPlayerDisplayNameError
} from "./player.errors";
import type {
  PlayerCreationValues,
  PlayerProgressionSnapshot,
  PlayerSnapshot
} from "./player.types";

export function normalizeDisplayName(displayName: string): string {
  return displayName.trim().replace(/\s+/g, " ");
}

export function validateDisplayName(displayName: unknown): string {
  if (typeof displayName !== "string") {
    throw new InvalidPlayerDisplayNameError("Display name is required.");
  }

  const normalizedDisplayName = normalizeDisplayName(displayName);

  if (normalizedDisplayName.length < playerDisplayNameRules.minLength) {
    throw new InvalidPlayerDisplayNameError(
      `Display name must be at least ${playerDisplayNameRules.minLength} characters.`
    );
  }

  if (normalizedDisplayName.length > playerDisplayNameRules.maxLength) {
    throw new InvalidPlayerDisplayNameError(
      `Display name must be at most ${playerDisplayNameRules.maxLength} characters.`
    );
  }

  if (!playerDisplayNameRules.pattern.test(normalizedDisplayName)) {
    throw new InvalidPlayerDisplayNameError(
      "Display name may only contain letters, numbers, spaces, hyphens, and underscores."
    );
  }

  return normalizedDisplayName;
}

export function buildInitialPlayerValues(
  displayName: string
): PlayerCreationValues {
  return {
    displayName: validateDisplayName(displayName),
    ...playerFoundationDefaults
  };
}

export interface RegeneratedEnergyState {
  energy: number;
  energyUpdatedAt: Date;
}

export function derivePlayerProgression(respect: number): PlayerProgressionSnapshot {
  const currentRank =
    [...playerRankCatalog].reverse().find((rank) => respect >= rank.minRespect) ??
    playerRankCatalog[0];
  const nextRank = playerRankCatalog.find((rank) => rank.level === currentRank.level + 1);

  if (!nextRank) {
    return {
      level: currentRank.level,
      rank: currentRank.rank,
      currentRespect: respect,
      currentLevelMinRespect: currentRank.minRespect,
      nextLevel: null,
      nextRank: null,
      nextLevelRespectRequired: null,
      respectToNextLevel: null,
      progressPercent: 100
    };
  }

  const currentLevelSpan = nextRank.minRespect - currentRank.minRespect;
  const respectEarnedThisLevel = respect - currentRank.minRespect;

  return {
    level: currentRank.level,
    rank: currentRank.rank,
    currentRespect: respect,
    currentLevelMinRespect: currentRank.minRespect,
    nextLevel: nextRank.level,
    nextRank: nextRank.rank,
    nextLevelRespectRequired: nextRank.minRespect,
    respectToNextLevel: nextRank.minRespect - respect,
    progressPercent: Math.max(
      0,
      Math.min(100, Math.floor((respectEarnedThisLevel / currentLevelSpan) * 100))
    )
  };
}

export function regeneratePlayerEnergy(
  player: Pick<PlayerSnapshot, "energy" | "energyUpdatedAt" | "updatedAt">,
  now: Date
): RegeneratedEnergyState {
  const energyUpdatedAt = player.energyUpdatedAt ?? player.updatedAt;

  if (player.energy >= playerEnergyRecoveryRules.maxEnergy) {
    return {
      energy: playerEnergyRecoveryRules.maxEnergy,
      energyUpdatedAt
    };
  }

  const elapsedMs = now.getTime() - energyUpdatedAt.getTime();
  const recoveredMinutes = Math.floor(
    elapsedMs / playerEnergyRecoveryRules.recoveryIntervalMs
  );

  if (recoveredMinutes <= 0) {
    return {
      energy: player.energy,
      energyUpdatedAt
    };
  }

  const recoveredEnergy = recoveredMinutes * playerEnergyRecoveryRules.energyPerMinute;
  const nextEnergy = Math.min(
    playerEnergyRecoveryRules.maxEnergy,
    player.energy + recoveredEnergy
  );

  if (nextEnergy >= playerEnergyRecoveryRules.maxEnergy) {
    return {
      energy: playerEnergyRecoveryRules.maxEnergy,
      energyUpdatedAt: now
    };
  }

  return {
    energy: nextEnergy,
    energyUpdatedAt: new Date(
      energyUpdatedAt.getTime() +
        recoveredMinutes * playerEnergyRecoveryRules.recoveryIntervalMs
    )
  };
}
