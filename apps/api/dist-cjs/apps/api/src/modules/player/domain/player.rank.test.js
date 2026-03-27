"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const player_rank_catalog_1 = require("./player-rank.catalog");
const player_policy_1 = require("./player.policy");
(0, vitest_1.describe)("player rank progression", () => {
    (0, vitest_1.it)("defines the static rank catalog in ascending respect order", () => {
        (0, vitest_1.expect)(player_rank_catalog_1.playerRankCatalog).toHaveLength(21);
        (0, vitest_1.expect)(player_rank_catalog_1.playerRankCatalog[0]).toEqual({
            level: 1,
            rank: "Scum",
            minRespect: 0
        });
        (0, vitest_1.expect)(player_rank_catalog_1.playerRankCatalog.at(-1)).toEqual({
            level: 21,
            rank: "Legendary Don",
            minRespect: 365500
        });
    });
    (0, vitest_1.it)("derives the current level and next level details from respect", () => {
        (0, vitest_1.expect)((0, player_policy_1.derivePlayerProgression)(900)).toEqual({
            level: 5,
            rank: "Picciotto",
            currentRespect: 900,
            currentLevelMinRespect: 900,
            nextLevel: 6,
            nextRank: "Shoplifter",
            nextLevelRespectRequired: 1500,
            respectToNextLevel: 600,
            progressPercent: 0
        });
    });
    (0, vitest_1.it)("tracks progress within the current level without promoting early", () => {
        (0, vitest_1.expect)((0, player_policy_1.derivePlayerProgression)(1499)).toEqual({
            level: 5,
            rank: "Picciotto",
            currentRespect: 1499,
            currentLevelMinRespect: 900,
            nextLevel: 6,
            nextRank: "Shoplifter",
            nextLevelRespectRequired: 1500,
            respectToNextLevel: 1,
            progressPercent: 99
        });
    });
    (0, vitest_1.it)("returns null next-level fields and 100 percent at the max level", () => {
        (0, vitest_1.expect)((0, player_policy_1.derivePlayerProgression)(500000)).toEqual({
            level: 21,
            rank: "Legendary Don",
            currentRespect: 500000,
            currentLevelMinRespect: 365500,
            nextLevel: null,
            nextRank: null,
            nextLevelRespectRequired: null,
            respectToNextLevel: null,
            progressPercent: 100
        });
    });
});
