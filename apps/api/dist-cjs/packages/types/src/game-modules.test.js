"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const game_modules_1 = require("./game-modules");
(0, vitest_1.describe)("moduleCatalog", () => {
    (0, vitest_1.it)("contains unique module keys", () => {
        const keys = game_modules_1.moduleCatalog.map((module) => module.key);
        (0, vitest_1.expect)(new Set(keys).size).toBe(keys.length);
    });
    (0, vitest_1.it)("declares a purpose and at least one interface touchpoint for every module", () => {
        for (const module of game_modules_1.moduleCatalog) {
            (0, vitest_1.expect)(module.purpose.length).toBeGreaterThan(10);
            (0, vitest_1.expect)(module.emits.length + module.consumes.length).toBeGreaterThan(0);
        }
    });
});
