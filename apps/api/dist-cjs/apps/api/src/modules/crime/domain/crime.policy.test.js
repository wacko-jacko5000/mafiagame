"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const crime_catalog_1 = require("./crime.catalog");
const crime_policy_1 = require("./crime.policy");
(0, vitest_1.describe)("crime catalog", () => {
    (0, vitest_1.it)("contains the full level-gated crime catalog", () => {
        (0, vitest_1.expect)(crime_catalog_1.starterCrimeCatalog).toHaveLength(84);
        (0, vitest_1.expect)(crime_catalog_1.starterCrimeCatalog[0]).toMatchObject({
            id: "pickpocket",
            unlockLevel: 1
        });
        (0, vitest_1.expect)(crime_catalog_1.starterCrimeCatalog.at(-1)).toMatchObject({
            id: "ultimate-power-play",
            unlockLevel: 21
        });
        (0, vitest_1.expect)((0, crime_catalog_1.getCrimeById)("shoplift-candy")?.name).toBe("Shoplift Candy");
    });
});
(0, vitest_1.describe)("resolveCrimeOutcome", () => {
    (0, vitest_1.it)("returns success rewards when the roll succeeds", () => {
        const crime = (0, crime_catalog_1.getCrimeById)("pickpocket");
        (0, vitest_1.expect)(crime).toBeDefined();
        (0, vitest_1.expect)((0, crime_policy_1.resolveCrimeOutcome)(crime, 0.3)).toMatchObject({
            crimeId: "pickpocket",
            success: true,
            energySpent: 10,
            respectAwarded: 1,
            consequence: {
                type: "none",
                activeUntil: null
            }
        });
    });
    (0, vitest_1.it)("returns a failure result without rewards when the roll fails", () => {
        const crime = (0, crime_catalog_1.getCrimeById)("mug-civilian");
        (0, vitest_1.expect)(crime).toBeDefined();
        (0, vitest_1.expect)((0, crime_policy_1.resolveCrimeOutcome)(crime, 0.9)).toEqual({
            crimeId: "mug-civilian",
            success: false,
            energySpent: 22,
            cashAwarded: 0,
            respectAwarded: 0,
            consequence: {
                type: "hospital",
                activeUntil: null
            }
        });
    });
});
