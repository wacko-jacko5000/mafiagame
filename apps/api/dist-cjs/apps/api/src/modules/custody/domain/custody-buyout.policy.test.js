"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const custody_buyout_policy_1 = require("./custody-buyout.policy");
(0, vitest_1.describe)("custody buyout policy", () => {
    (0, vitest_1.it)("applies linear escalation on the base price", () => {
        (0, vitest_1.expect)((0, custody_buyout_policy_1.calculateCustodyPricePerMinute)({
            basePricePerMinute: 100,
            entryCountSinceLevelReset: 1,
            escalationEnabled: true,
            escalationPercentage: 0.1
        })).toBe(100);
        (0, vitest_1.expect)((0, custody_buyout_policy_1.calculateCustodyPricePerMinute)({
            basePricePerMinute: 100,
            entryCountSinceLevelReset: 4,
            escalationEnabled: true,
            escalationPercentage: 0.1
        })).toBe(130);
    });
    (0, vitest_1.it)("always rounds the final buyout price up", () => {
        (0, vitest_1.expect)((0, custody_buyout_policy_1.calculateCustodyBuyoutPrice)({
            remainingSeconds: 95,
            currentPricePerMinute: 123,
            minimumPrice: null,
            roundingRule: "ceil"
        })).toBe(195);
    });
});
