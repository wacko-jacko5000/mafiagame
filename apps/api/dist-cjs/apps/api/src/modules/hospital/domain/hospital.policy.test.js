"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const hospital_policy_1 = require("./hospital.policy");
(0, vitest_1.describe)("hospital policy", () => {
    (0, vitest_1.it)("builds a hospital release time from the current time", () => {
        const now = new Date("2026-03-16T20:00:00.000Z");
        (0, vitest_1.expect)((0, hospital_policy_1.buildHospitalReleaseTime)(now, 480).toISOString()).toBe("2026-03-16T20:08:00.000Z");
    });
    (0, vitest_1.it)("treats expired hospital timestamps as inactive", () => {
        const now = new Date("2026-03-16T20:08:01.000Z");
        const hospitalizedUntil = new Date("2026-03-16T20:08:00.000Z");
        (0, vitest_1.expect)((0, hospital_policy_1.getHospitalStatus)("player-1", hospitalizedUntil, now)).toEqual({
            playerId: "player-1",
            active: false,
            until: null,
            remainingSeconds: 0,
            reason: null
        });
    });
});
