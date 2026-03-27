"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.describe)("ApiHealthResponse", () => {
    (0, vitest_1.it)("captures the backend runtime status contract", () => {
        const response = {
            service: "api",
            status: "ok",
            timestamp: new Date().toISOString(),
            database: {
                status: "up"
            }
        };
        (0, vitest_1.expect)(response.database.status).toBe("up");
    });
});
