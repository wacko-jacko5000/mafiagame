"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const game_balance_1 = require("./game-balance");
(0, vitest_1.describe)("getStartingBalance", () => {
    (0, vitest_1.it)("returns non-zero baseline values for the initial game loop", () => {
        const balance = (0, game_balance_1.getStartingBalance)();
        (0, vitest_1.expect)(balance.economy.startingCash).toBeGreaterThan(0);
        (0, vitest_1.expect)(balance.stats.baseHealth).toBe(100);
        (0, vitest_1.expect)(balance.crime.defaultCooldownSeconds).toBeGreaterThanOrEqual(30);
    });
});
