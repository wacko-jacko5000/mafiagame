"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const jail_policy_1 = require("./jail.policy");
(0, vitest_1.describe)("jail policy", () => {
    (0, vitest_1.it)("builds a jail release time from the current time", () => {
        const now = new Date("2026-03-16T20:00:00.000Z");
        (0, vitest_1.expect)((0, jail_policy_1.buildJailReleaseTime)(now, 300).toISOString()).toBe("2026-03-16T20:05:00.000Z");
    });
    (0, vitest_1.it)("treats expired jail timestamps as inactive", () => {
        const now = new Date("2026-03-16T20:05:01.000Z");
        const jailedUntil = new Date("2026-03-16T20:05:00.000Z");
        (0, vitest_1.expect)((0, jail_policy_1.getJailStatus)("player-1", jailedUntil, now)).toEqual({
            playerId: "player-1",
            active: false,
            until: null,
            remainingSeconds: 0,
            reason: null
        });
    });
});
