"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const health_service_1 = require("./health.service");
(0, vitest_1.describe)("HealthService", () => {
    (0, vitest_1.it)("reports api and database status", async () => {
        const service = new health_service_1.HealthService({
            checkConnection: vitest_1.vi.fn().mockResolvedValue(true)
        });
        const result = await service.getHealth();
        (0, vitest_1.expect)(result.service).toBe("api");
        (0, vitest_1.expect)(result.status).toBe("ok");
        (0, vitest_1.expect)(result.database.status).toBe("up");
        (0, vitest_1.expect)(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
    (0, vitest_1.it)("degrades when the database probe fails", async () => {
        const service = new health_service_1.HealthService({
            checkConnection: vitest_1.vi.fn().mockRejectedValue(new Error("db down"))
        });
        const result = await service.getHealth();
        (0, vitest_1.expect)(result.status).toBe("degraded");
        (0, vitest_1.expect)(result.database.status).toBe("down");
    });
});
