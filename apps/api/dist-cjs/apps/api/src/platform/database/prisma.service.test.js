"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_service_1 = require("./prisma.service");
(0, vitest_1.describe)("PrismaService.checkConnection", () => {
    (0, vitest_1.it)("returns true when the probe query returns 1", async () => {
        const service = {
            $queryRaw: vitest_1.vi.fn().mockResolvedValue([{ result: 1 }])
        };
        const connected = await prisma_service_1.PrismaService.prototype.checkConnection.call(service);
        (0, vitest_1.expect)(connected).toBe(true);
    });
});
