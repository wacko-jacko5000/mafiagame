"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const runtime_foundation_1 = require("./runtime-foundation");
(0, vitest_1.describe)("getRuntimeFoundationConfig", () => {
    (0, vitest_1.it)("exposes stable default ports for web and api runtimes", () => {
        const runtimeConfig = (0, runtime_foundation_1.getRuntimeFoundationConfig)();
        (0, vitest_1.expect)(runtimeConfig.web.defaultPort).toBe(3000);
        (0, vitest_1.expect)(runtimeConfig.api.defaultPort).toBe(3001);
        (0, vitest_1.expect)(runtimeConfig.api.globalPrefix).toBe("api");
        (0, vitest_1.expect)(runtimeConfig.api.healthPath).toBe("/health");
    });
});
