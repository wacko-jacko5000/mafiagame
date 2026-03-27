"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const player_policy_1 = require("./player.policy");
(0, vitest_1.describe)("player policy", () => {
    (0, vitest_1.it)("normalizes and validates a display name", () => {
        (0, vitest_1.expect)((0, player_policy_1.normalizeDisplayName)("  Don   Luca ")).toBe("Don Luca");
        (0, vitest_1.expect)((0, player_policy_1.validateDisplayName)("Don Luca")).toBe("Don Luca");
    });
    (0, vitest_1.it)("provides explicit initial player values", () => {
        (0, vitest_1.expect)((0, player_policy_1.buildInitialPlayerValues)("Don Luca")).toMatchObject({
            displayName: "Don Luca",
            cash: 2500,
            respect: 0,
            energy: 100,
            health: 100
        });
    });
    (0, vitest_1.it)("rejects invalid display names", () => {
        (0, vitest_1.expect)(() => (0, player_policy_1.validateDisplayName)("ab")).toThrowError(/at least/i);
        (0, vitest_1.expect)(() => (0, player_policy_1.validateDisplayName)("bad*name")).toThrowError(/only contain/i);
    });
    (0, vitest_1.it)("regenerates energy by one point per elapsed minute", () => {
        (0, vitest_1.expect)((0, player_policy_1.regeneratePlayerEnergy)({
            energy: 10,
            energyUpdatedAt: new Date("2026-03-19T19:00:00.000Z"),
            updatedAt: new Date("2026-03-19T19:00:00.000Z")
        }, new Date("2026-03-19T19:05:30.000Z"))).toEqual({
            energy: 15,
            energyUpdatedAt: new Date("2026-03-19T19:05:00.000Z")
        });
    });
    (0, vitest_1.it)("caps regenerated energy at the max and discards capped overflow time", () => {
        (0, vitest_1.expect)((0, player_policy_1.regeneratePlayerEnergy)({
            energy: 98,
            energyUpdatedAt: new Date("2026-03-19T19:00:00.000Z"),
            updatedAt: new Date("2026-03-19T19:00:00.000Z")
        }, new Date("2026-03-19T19:10:00.000Z"))).toEqual({
            energy: 100,
            energyUpdatedAt: new Date("2026-03-19T19:10:00.000Z")
        });
    });
});
