"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const gangs_errors_1 = require("./gangs.errors");
const gangs_policy_1 = require("./gangs.policy");
(0, vitest_1.describe)("gangs.policy", () => {
    (0, vitest_1.it)("normalizes gang names before persistence", () => {
        (0, vitest_1.expect)((0, gangs_policy_1.normalizeGangName)("  Night   Owls  ")).toBe("Night Owls");
        (0, vitest_1.expect)((0, gangs_policy_1.buildCreateGangValues)(crypto.randomUUID(), "  Night   Owls  ").name).toBe("Night Owls");
    });
    (0, vitest_1.it)("rejects invalid gang names", () => {
        (0, vitest_1.expect)(() => (0, gangs_policy_1.validateGangName)("x")).toThrow(gangs_errors_1.InvalidGangNameError);
        (0, vitest_1.expect)(() => (0, gangs_policy_1.validateGangName)("Bad*Name")).toThrow(gangs_errors_1.InvalidGangNameError);
    });
});
