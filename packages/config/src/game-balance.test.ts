import { describe, expect, it } from "vitest";

import { getStartingBalance } from "./game-balance";

describe("getStartingBalance", () => {
  it("returns non-zero baseline values for the initial game loop", () => {
    const balance = getStartingBalance();

    expect(balance.economy.startingCash).toBeGreaterThan(0);
    expect(balance.stats.baseHealth).toBe(100);
    expect(balance.crime.defaultCooldownSeconds).toBeGreaterThanOrEqual(30);
  });
});
