"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPlayerResponseBody = toPlayerResponseBody;
exports.toPlayerResourcesResponseBody = toPlayerResourcesResponseBody;
const player_policy_1 = require("../domain/player.policy");
function toPlayerResponseBody(player) {
    const progression = (0, player_policy_1.derivePlayerProgression)(player.respect);
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
function toPlayerResourcesResponseBody(resources) {
    return resources;
}
