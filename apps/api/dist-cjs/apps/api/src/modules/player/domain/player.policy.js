"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDisplayName = normalizeDisplayName;
exports.validateDisplayName = validateDisplayName;
exports.buildInitialPlayerValues = buildInitialPlayerValues;
exports.derivePlayerProgression = derivePlayerProgression;
exports.regeneratePlayerEnergy = regeneratePlayerEnergy;
const player_constants_1 = require("./player.constants");
const player_rank_catalog_1 = require("./player-rank.catalog");
const player_errors_1 = require("./player.errors");
function normalizeDisplayName(displayName) {
    return displayName.trim().replace(/\s+/g, " ");
}
function validateDisplayName(displayName) {
    if (typeof displayName !== "string") {
        throw new player_errors_1.InvalidPlayerDisplayNameError("Display name is required.");
    }
    const normalizedDisplayName = normalizeDisplayName(displayName);
    if (normalizedDisplayName.length < player_constants_1.playerDisplayNameRules.minLength) {
        throw new player_errors_1.InvalidPlayerDisplayNameError(`Display name must be at least ${player_constants_1.playerDisplayNameRules.minLength} characters.`);
    }
    if (normalizedDisplayName.length > player_constants_1.playerDisplayNameRules.maxLength) {
        throw new player_errors_1.InvalidPlayerDisplayNameError(`Display name must be at most ${player_constants_1.playerDisplayNameRules.maxLength} characters.`);
    }
    if (!player_constants_1.playerDisplayNameRules.pattern.test(normalizedDisplayName)) {
        throw new player_errors_1.InvalidPlayerDisplayNameError("Display name may only contain letters, numbers, spaces, hyphens, and underscores.");
    }
    return normalizedDisplayName;
}
function buildInitialPlayerValues(displayName) {
    return {
        displayName: validateDisplayName(displayName),
        ...player_constants_1.playerFoundationDefaults
    };
}
function derivePlayerProgression(respect) {
    const currentRank = [...player_rank_catalog_1.playerRankCatalog].reverse().find((rank) => respect >= rank.minRespect) ??
        player_rank_catalog_1.playerRankCatalog[0];
    const nextRank = player_rank_catalog_1.playerRankCatalog.find((rank) => rank.level === currentRank.level + 1);
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
        progressPercent: Math.max(0, Math.min(100, Math.floor((respectEarnedThisLevel / currentLevelSpan) * 100)))
    };
}
function regeneratePlayerEnergy(player, now) {
    const energyUpdatedAt = player.energyUpdatedAt ?? player.updatedAt;
    if (player.energy >= player_constants_1.playerEnergyRecoveryRules.maxEnergy) {
        return {
            energy: player_constants_1.playerEnergyRecoveryRules.maxEnergy,
            energyUpdatedAt
        };
    }
    const elapsedMs = now.getTime() - energyUpdatedAt.getTime();
    const recoveredMinutes = Math.floor(elapsedMs / player_constants_1.playerEnergyRecoveryRules.recoveryIntervalMs);
    if (recoveredMinutes <= 0) {
        return {
            energy: player.energy,
            energyUpdatedAt
        };
    }
    const recoveredEnergy = recoveredMinutes * player_constants_1.playerEnergyRecoveryRules.energyPerMinute;
    const nextEnergy = Math.min(player_constants_1.playerEnergyRecoveryRules.maxEnergy, player.energy + recoveredEnergy);
    if (nextEnergy >= player_constants_1.playerEnergyRecoveryRules.maxEnergy) {
        return {
            energy: player_constants_1.playerEnergyRecoveryRules.maxEnergy,
            energyUpdatedAt: now
        };
    }
    return {
        energy: nextEnergy,
        energyUpdatedAt: new Date(energyUpdatedAt.getTime() +
            recoveredMinutes * player_constants_1.playerEnergyRecoveryRules.recoveryIntervalMs)
    };
}
