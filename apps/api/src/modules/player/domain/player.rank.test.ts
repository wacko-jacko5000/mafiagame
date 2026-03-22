import { describe, expect, it } from "vitest";

import { playerRankCatalog } from "./player-rank.catalog";
import { derivePlayerProgression } from "./player.policy";

describe("player rank progression", () => {
  it("defines the static rank catalog in ascending respect order", () => {
    expect(playerRankCatalog).toHaveLength(21);
    expect(playerRankCatalog[0]).toEqual({
      level: 1,
      rank: "Scum",
      minRespect: 0
    });
    expect(playerRankCatalog.at(-1)).toEqual({
      level: 21,
      rank: "Legendary Don",
      minRespect: 365500
    });
  });

  it("derives the current level and next level details from respect", () => {
    expect(derivePlayerProgression(900)).toEqual({
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

  it("tracks progress within the current level without promoting early", () => {
    expect(derivePlayerProgression(1499)).toEqual({
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

  it("returns null next-level fields and 100 percent at the max level", () => {
    expect(derivePlayerProgression(500000)).toEqual({
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
